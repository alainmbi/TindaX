import { mkdir, rm } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Order from '#models/order'
import type User from '#models/user'
import Product from '#models/product'
import {
  storeProductValidator,
  updateProductValidator,
  updateStoreStatusValidator,
} from '#validators/store_product_validator'

export default class VendorController {
  public async dashboard({ auth, view }: HttpContext) {
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)
    const stats = await this.getDashboardStats(store.id)
    const recentOrders = await this.getStoreOrders(store.id, 4)

    return view.render('pages/vendor/dashboard', {
      store,
      stats,
      recentOrders,
      activeSection: 'dashboard',
      pageTitle: 'Dashboard marchand',
      pageDescription: 'Vue d’ensemble boutique, ventes du jour et commandes prioritaires.',
    })
  }

  public async products({ auth, view }: HttpContext) {
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)
    const products = await store.related('products').query().orderBy('created_at', 'desc')

    return view.render('pages/vendor/products', {
      store,
      products,
      activeSection: 'products',
      pageTitle: 'Catalogue produits',
      pageDescription: 'Ajout, edition, disponibilite et images de vos produits.',
    })
  }

  public async orders({ auth, view }: HttpContext) {
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)
    const orders = await this.getStoreOrders(store.id)

    return view.render('pages/vendor/orders', {
      store,
      orders,
      activeSection: 'orders',
      pageTitle: 'Commandes recues',
      pageDescription: 'Suivi des commandes, preparation et pilotage des statuts.',
    })
  }

  public async storeProduct({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(storeProductValidator)
    const imageFile = request.file('image')
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)
    const imagePath = imageFile ? await this.storeProductImage(imageFile) : null

    const product = await Product.create({
      storeId: store.id,
      name: payload.name,
      description: payload.description ?? null,
      price: payload.price.toFixed(2),
      image: imagePath,
      status: payload.status ?? 'disponible',
      category: payload.category,
    })

    session.flash(
      'success',
      `Le produit "${product.name}" a bien ete ajoute au catalogue de ${store.name}.`
    )

    return response.redirect().back()
  }

  public async updateProduct({ auth, params, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(updateProductValidator)
    const imageFile = request.file('editImage')
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)
    const product = await this.getVendorProductOrFail(store.id, params.productId)

    if (payload.editName !== undefined) {
      product.name = payload.editName
    }

    if (payload.editDescription !== undefined) {
      product.description = payload.editDescription || null
    }

    if (payload.editPrice !== undefined) {
      product.price = payload.editPrice.toFixed(2)
    }

    if (imageFile) {
      const previousImage = product.image
      product.image = await this.storeProductImage(imageFile)
      await this.deleteProductImage(previousImage)
    }

    if (payload.editCategory !== undefined) {
      product.category = payload.editCategory
    }

    if (payload.editStatus !== undefined) {
      product.status = payload.editStatus
    }

    await product.save()

    session.flash('success', `Le produit "${product.name}" a bien ete mis a jour.`)

    return response.redirect().back()
  }

  public async destroyProduct({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)
    const product = await this.getVendorProductOrFail(store.id, params.productId)
    const imagePath = product.image
    const productName = product.name

    await product.delete()
    await this.deleteProductImage(imagePath)

    session.flash('success', `Le produit "${productName}" a bien ete supprime du catalogue.`)

    return response.redirect().back()
  }

  public async toggleProductStatus({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)
    const product = await this.getVendorProductOrFail(store.id, params.productId)

    product.status = product.status === 'disponible' ? 'rupture' : 'disponible'
    await product.save()

    session.flash(
      'success',
      `Le produit "${product.name}" est maintenant ${product.status === 'disponible' ? 'disponible' : 'en rupture'}.`
    )

    return response.redirect().back()
  }

  public async updateStatus({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(updateStoreStatusValidator)
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)

    store.status = payload.storeStatus
    await store.save()

    session.flash(
      'success',
      `La boutique ${store.name} est maintenant ${payload.storeStatus === 'ouvert' ? 'ouverte' : 'fermee'}.`
    )

    return response.redirect().back()
  }

  public async advanceOrderStatus({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)
    const order = await this.getVendorOrderOrFail(store.id, params.orderId)
    const nextStatus = this.getNextOrderStatus(order.status)

    if (nextStatus === order.status) {
      session.flash(
        'info',
        `La commande #${order.id} ne peut pas progresser davantage depuis le statut "${order.status}".`
      )

      return response.redirect().back()
    }

    order.status = nextStatus
    await order.save()

    session.flash(
      'success',
      `La commande #${order.id} est maintenant au statut "${this.formatOrderStatus(nextStatus)}".`
    )

    return response.redirect().back()
  }

  public async cancelOrder({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const store = await this.getVendorStoreOrFail(user)
    const order = await this.getVendorOrderOrFail(store.id, params.orderId)

    if (order.status === 'cancelled') {
      session.flash('info', `La commande #${order.id} est deja annulee.`)
      return response.redirect().back()
    }

    if (order.status === 'delivered') {
      session.flash('error', `La commande #${order.id} a deja ete livree et ne peut plus etre annulee.`)
      return response.redirect().back()
    }

    order.status = 'cancelled'
    await order.save()

    session.flash('success', `La commande #${order.id} a ete annulee.`)

    return response.redirect().back()
  }

  private async getVendorStoreOrFail(user: User) {
    return user.related('store').query().firstOrFail()
  }

  private async getVendorProductOrFail(storeId: number, productId: number) {
    return Product.query().where('store_id', storeId).where('id', productId).firstOrFail()
  }

  private async getVendorOrderOrFail(storeId: number, orderId: number) {
    return Order.query().where('store_id', storeId).where('id', orderId).firstOrFail()
  }

  private async getStoreOrders(storeId: number, limit?: number) {
    const query = Order.query()
      .where('store_id', storeId)
      .preload('user')
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('product')
      })
      .orderBy('created_at', 'desc')

    if (limit) {
      query.limit(limit)
    }

    return await query
  }

  private async getDashboardStats(storeId: number) {
    const todayStart = DateTime.local().startOf('day').toSQL()
    const productsCount = await Product.query().where('store_id', storeId).count('* as total')
    const pendingCount = await Order.query()
      .where('store_id', storeId)
      .whereIn('status', ['pending', 'preparing'])
      .count('* as total')
    const todayOrders = await Order.query()
      .where('store_id', storeId)
      .where('created_at', '>=', todayStart!)
      .whereNot('status', 'cancelled')

    const todaysSales = todayOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0)

    return {
      productsCount: Number(productsCount[0].$extras.total || 0),
      pendingCount: Number(pendingCount[0].$extras.total || 0),
      todaysOrdersCount: todayOrders.length,
      todaysSales,
    }
  }

  private getNextOrderStatus(status: Order['status']) {
    if (status === 'pending') {
      return 'preparing'
    }

    if (status === 'preparing') {
      return 'ready'
    }

    if (status === 'ready') {
      return 'delivered'
    }

    return status
  }

  private formatOrderStatus(status: Order['status']) {
    if (status === 'pending') {
      return 'En attente'
    }

    if (status === 'preparing') {
      return 'En preparation'
    }

    if (status === 'ready') {
      return 'Pret'
    }

    if (status === 'delivered') {
      return 'Livre'
    }

    return 'Annule'
  }

  private async storeProductImage(imageFile: MultipartFile) {
    const uploadsDirectory = app.makePath('public', 'uploads', 'products')
    await mkdir(uploadsDirectory, { recursive: true })

    const extension = extname(imageFile.clientName || '').replace('.', '') || imageFile.extname || 'jpg'
    const fileName = `${randomUUID()}.${extension}`

    await imageFile.move(uploadsDirectory, {
      name: fileName,
      overwrite: true,
    })

    if (!imageFile.isValid) {
      throw imageFile.errors[0]
    }

    return `/uploads/products/${fileName}`
  }

  private async deleteProductImage(imagePath: string | null) {
    if (!imagePath) {
      return
    }

    if (!imagePath.startsWith('/uploads/products/')) {
      return
    }

    const relativePath = imagePath.replace('/uploads/products/', '')
    const absolutePath = join(app.makePath('public', 'uploads', 'products'), relativePath)

    await rm(absolutePath, { force: true })
  }
}
