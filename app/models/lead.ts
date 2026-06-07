import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column } from '@adonisjs/lucid/orm'

export default class Lead extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare category: 'contact' | 'service_request'

  @column()
  declare source: string

  @column({ columnName: 'full_name' })
  declare fullName: string | null

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare profile: string | null

  @column({ columnName: 'service_query' })
  declare serviceQuery: string | null

  @column()
  declare message: string | null

  @column({ columnName: 'newsletter_opt_in' })
  declare newsletterOptIn: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @beforeSave()
  static normalizeContactFields(lead: Lead) {
    if (lead.email) {
      lead.email = lead.email.trim().toLowerCase()
    }

    if (lead.phone) {
      lead.phone = lead.phone.replace(/[^\d+]/g, '')
    }
  }
}
