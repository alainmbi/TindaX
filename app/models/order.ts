import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import OrderItem from '#models/order_item'
import Store from '#models/store'
import User from '#models/user'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'store_id' })
  declare storeId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'driver_id' })
  declare driverId: number | null

  @column({ columnName: 'total_price' })
  declare totalPrice: string

  @column()
  declare status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

  @column({ columnName: 'delivery_address' })
  declare deliveryAddress: string

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'driverId',
  })
  declare driver: BelongsTo<typeof User>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
