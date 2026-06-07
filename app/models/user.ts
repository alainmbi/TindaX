import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import DriverProfile from '#models/driver_profile'
import Order from '#models/order'
import Store from '#models/store'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'full_name' })
  declare fullName: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare password: string | null

  @column()
  declare role: 'client' | 'driver' | 'vendor' | 'admin'

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @hasOne(() => Store)
  declare store: HasOne<typeof Store>

  @hasOne(() => DriverProfile)
  declare driverProfile: HasOne<typeof DriverProfile>

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @hasMany(() => Order, {
    foreignKey: 'driverId',
  })
  declare assignedOrders: HasMany<typeof Order>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
