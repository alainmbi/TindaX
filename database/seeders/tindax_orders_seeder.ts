import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import DriverProfile from '#models/driver_profile'
import Order from '#models/order'
import Store from '#models/store'
import User from '#models/user'
import { kinshasaCommunes, normalizeCommuneName } from '#services/kinshasa_communes'

const orderStatuses: Order['status'][] = ['pending', 'preparing', 'ready', 'delivered', 'cancelled']

export default class extends BaseSeeder {
  static environment = ['development']

  public async run() {
    for (const [index, commune] of kinshasaCommunes.entries()) {
      const slug = normalizeCommuneName(commune.name)
      const customer = await User.findByOrFail('email', `client.${slug}@tindax.test`)
      const vendor = await User.findByOrFail('email', `vendor.${slug}@tindax.test`)
      const store = await Store.findByOrFail('userId', vendor.id)
      const products = await store.related('products').query().orderBy('id', 'asc')

      if (products.length < 2) {
        continue
      }

      const nearestDriver = await this.findNearestAvailableDriver(store)
      const orderOneCreatedAt = DateTime.local().minus({ hours: index % 6, minutes: index * 2 })
      const orderTwoCreatedAt = DateTime.local().minus({ days: 1, hours: index % 5 })

      await this.upsertOrder({
        store,
        customer,
        nearestDriverId: nearestDriver?.userId ?? null,
        status: orderStatuses[index % orderStatuses.length],
        deliveryAddress: `${commune.name}, Kinshasa - Livraison domicile bloc A`,
        createdAt: orderOneCreatedAt,
        items: [
          { productId: products[0].id, quantity: 1, unitPrice: products[0].price },
          { productId: products[1].id, quantity: 2, unitPrice: products[1].price },
        ],
      })

      await this.upsertOrder({
        store,
        customer,
        nearestDriverId: nearestDriver?.userId ?? null,
        status: orderStatuses[(index + 2) % orderStatuses.length],
        deliveryAddress: `${commune.name}, Kinshasa - Livraison bureau avenue principale`,
        createdAt: orderTwoCreatedAt,
        items: [
          { productId: products[0].id, quantity: 1, unitPrice: products[0].price },
          {
            productId: products[Math.min(2, products.length - 1)].id,
            quantity: 1,
            unitPrice: products[Math.min(2, products.length - 1)].price,
          },
        ],
      })
    }

    console.log(
      `Seeder commandes TindaX charge avec jusqu'a ${kinshasaCommunes.length * 2} commandes fictives.`
    )
  }

  private async upsertOrder(payload: {
    store: Store
    customer: User
    nearestDriverId: number | null
    status: Order['status']
    deliveryAddress: string
    createdAt: DateTime
    items: Array<{ productId: number; quantity: number; unitPrice: string }>
  }) {
    const totalPrice = payload.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    )

    const order = await Order.updateOrCreate(
      {
        storeId: payload.store.id,
        userId: payload.customer.id,
        deliveryAddress: payload.deliveryAddress,
      },
      {
        storeId: payload.store.id,
        userId: payload.customer.id,
        driverId: payload.nearestDriverId,
        totalPrice: totalPrice.toFixed(2),
        status: payload.status,
        deliveryAddress: payload.deliveryAddress,
        createdAt: payload.createdAt,
        updatedAt: payload.createdAt,
      }
    )

    await order.related('items').query().delete()
    await order.related('items').createMany(payload.items)
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
}
