import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import OrderItem from '#models/order_item'
import Store from '#models/store'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'store_id' })
  declare storeId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare price: string

  @column()
  declare image: string | null

  @column()
  declare status: 'disponible' | 'rupture'

  @column()
  declare category: 'repas' | 'colis' | 'courses'

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @hasMany(() => OrderItem)
  declare orderItems: HasMany<typeof OrderItem>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
