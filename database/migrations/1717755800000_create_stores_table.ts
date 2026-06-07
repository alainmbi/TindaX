import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stores'

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
      table.string('name', 160).notNullable()
      table.text('description').nullable()
      table.string('logo_image', 255).nullable()
      table.text('address').notNullable()
      table.decimal('latitude', 10, 7).nullable()
      table.decimal('longitude', 10, 7).nullable()
      table
        .enum('status', ['ouvert', 'ferme'], {
          useNative: true,
          enumName: 'store_status',
          existingType: false,
        })
        .notNullable()
        .defaultTo('ferme')
        .index()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS store_status')
  }
}
