import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { BaseModel, belongsTo, column, hasMany, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'
import Product from '#models/product'
import User from '#models/user'

export default class Store extends BaseModel {
  static nearby = scope((query, latitude: number, longitude: number, radiusKm: number = 10) => {
    const haversineSql = `
      6371 * acos(
        cos(radians(?)) * cos(radians(CAST(stores.latitude AS double precision))) *
        cos(radians(CAST(stores.longitude AS double precision)) - radians(?)) +
        sin(radians(?)) * sin(radians(CAST(stores.latitude AS double precision)))
      )
    `

    query
      .whereNotNull('stores.latitude')
      .whereNotNull('stores.longitude')
      .select('stores.*')
      .select(db.raw(`${haversineSql} as distance_km`, [latitude, longitude, latitude]))
      .whereRaw(`${haversineSql} <= ?`, [latitude, longitude, latitude, radiusKm])
      .orderBy('distance_km', 'asc')
  })

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column({ columnName: 'logo_image' })
  declare logoImage: string | null

  @column()
  declare address: string

  @column()
  declare latitude: string | null

  @column()
  declare longitude: string | null

  @column()
  declare status: 'ouvert' | 'ferme'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
