import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'driver_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .unique()

      table.decimal('latitude', 10, 7).nullable()
      table.decimal('longitude', 10, 7).nullable()
      table
        .enum('status', ['disponible', 'en_course', 'hors_ligne'], {
          useNative: true,
          enumName: 'driver_status',
          existingType: false,
        })
        .notNullable()
        .defaultTo('hors_ligne')
        .index()
      table
        .enum('vehicle_type', ['moto', 'velo', 'voiture', 'camionnette'], {
          useNative: true,
          enumName: 'driver_vehicle_type',
          existingType: false,
        })
        .notNullable()
        .defaultTo('moto')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS driver_status')
    this.schema.raw('DROP TYPE IF EXISTS driver_vehicle_type')
  }
}
