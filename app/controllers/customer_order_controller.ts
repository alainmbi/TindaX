import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import DriverProfile from '#models/driver_profile'
import Order from '#models/order'
import Product from '#models/product'
import Store from '#models/store'
import { findKinshasaCommuneByName } from '#services/kinshasa_communes'
import {
  searchNearbyProductsValidator,
  storeCustomerOrderValidator,
} from '#validators/customer_order_validator'

export default class CustomerOrderController {
  public async search({ request, response }: HttpContext) {
    const payload = await request.validateUsing(searchNearbyProductsValidator)
    const radiusKm = payload.radiusKm ?? 5
    const results = await this.searchNearbyCatalog(
      payload.keyword,
      payload.latitude,
      payload.longitude,
      radiusKm
    )

    return response.ok({
      keyword: payload.keyword,
      radiusKm,
      total: results.length,
      data: results,
    })
  }

  public async testGeo({ request, response }: HttpContext) {
    const commune = findKinshasaCommuneByName(request.input('commune'))
    const resolvedLatitude = commune
      ? commune.latitude
      : Number(request.input('latitude', -4.3271))
    const resolvedLongitude = commune
      ? commune.longitude
      : Number(request.input('longitude', 15.2967))

    const payload = await searchNearbyProductsValidator.validate({
      keyword: request.input('keyword', 'Poulet'),
      latitude: resolvedLatitude,
      longitude: resolvedLongitude,
      radiusKm: Number(request.input('radiusKm', 10)),
    })

    const radiusKm = payload.radiusKm ?? 10
    const results = await this.searchNearbyCatalog(
      payload.keyword,
      payload.latitude,
      payload.longitude,
      radiusKm
    )

    return response.ok({
      scenario: commune
        ? `Test geolocalisation TindaX autour de la commune de ${commune.name}`
        : 'Test geolocalisation TindaX autour de Victoire / Kasa-Vubu',
      commune: commune?.name ?? null,
      keyword: payload.keyword,
      customerPosition: {
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      radiusKm,
      total: results.length,
      data: results,
    })
  }

  public async store({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(storeCustomerOrderValidator)
    const customer = auth.getUserOrFail()

    const store = await Store.query()
      .where('id', payload.storeId)
      .where('status', 'ouvert')
      .firstOrFail()

    const requestedProductIds = payload.items.map((item) => item.productId)
    const products = await Product.query()
      .where('store_id', store.id)
      .whereIn('id', requestedProductIds)
      .where('status', 'disponible')

    if (products.length !== requestedProductIds.length) {
      return response.badRequest({
        message:
          'Un ou plusieurs produits du panier ne sont plus disponibles dans cette boutique.',
      })
    }

    const productMap = new Map(products.map((product) => [product.id, product]))
    const itemsPayload = payload.items.map((item) => {
      const product = productMap.get(item.productId)!
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      }
    })

    const totalPrice = itemsPayload.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    )

    const nearestDriver = await this.findNearestAvailableDriver(store)

    const order = await db.transaction(async (trx) => {
      const createdOrder = await Order.create(
        {
          storeId: store.id,
          userId: customer.id,
          driverId: nearestDriver?.userId ?? null,
          totalPrice: totalPrice.toFixed(2),
          status: 'pending',
          deliveryAddress: payload.deliveryAddress,
        },
        { client: trx }
      )

      createdOrder.useTransaction(trx)
      await createdOrder.related('items').createMany(itemsPayload)

      return createdOrder
    })

    await order.load('items')

    return response.created({
      message: 'Commande creee avec succes et pre-affectation logistique preparee.',
      data: {
        orderId: order.id,
        status: order.status,
        totalPrice: Number(order.totalPrice),
        assignedDriver: nearestDriver
          ? {
              userId: nearestDriver.userId,
              vehicleType: nearestDriver.vehicleType,
              distanceKm: Number(nearestDriver.$extras.distance_km),
            }
          : null,
      },
    })
  }

  private async findNearestAvailableDriver(store: Store) {
    if (!store.latitude || !store.longitude) {
      return null
    }

    const latitude = Number(store.latitude)
    const longitude = Number(store.longitude)

    const haversineSql = `
      6371 * acos(
        cos(radians(?)) * cos(radians(CAST(driver_profiles.latitude AS double precision))) *
        cos(radians(CAST(driver_profiles.longitude AS double precision)) - radians(?)) +
        sin(radians(?)) * sin(radians(CAST(driver_profiles.latitude AS double precision)))
      )
    `

    return await DriverProfile.query()
      .where('status', 'disponible')
      .whereNotNull('latitude')
      .whereNotNull('longitude')
      .select('driver_profiles.*')
      .select(db.raw(`${haversineSql} as distance_km`, [latitude, longitude, latitude]))
      .orderBy('distance_km', 'asc')
      .first()
  }

  private async searchNearbyCatalog(
    keyword: string,
    latitude: number,
    longitude: number,
    radiusKm: number
  ) {
    const nearbyStores = await Store.query()
      .withScopes((scopes) => scopes.nearby(latitude, longitude, radiusKm))
      .where('status', 'ouvert')
      .preload('products', (productsQuery) => {
        productsQuery
          .where('status', 'disponible')
          .where((query) => {
            query.whereILike('name', `%${keyword}%`).orWhereILike('description', `%${keyword}%`)
          })
          .orderBy('name', 'asc')
      })

    return nearbyStores
      .filter((store) => store.products.length > 0)
      .flatMap((store) =>
        store.products.map((product) => ({
          productId: product.id,
          productName: product.name,
          description: product.description,
          price: Number(product.price),
          image: product.image,
          category: product.category,
          store: {
            id: store.id,
            name: store.name,
            address: store.address,
            distanceKm: Number(store.$extras.distance_km),
          },
        }))
      )
  }
}
