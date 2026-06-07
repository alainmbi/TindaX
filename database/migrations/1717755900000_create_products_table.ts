import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('store_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('stores')
        .onDelete('CASCADE')
        .index()
      table.string('name', 160).notNullable()
      table.text('description').nullable()
      table.decimal('price', 12, 2).notNullable()
      table.string('image', 255).nullable()
      table
        .enum('status', ['disponible', 'rupture'], {
          useNative: true,
          enumName: 'product_status',
          existingType: false,
        })
        .notNullable()
        .defaultTo('disponible')
        .index()
      table
        .enum('category', ['repas', 'colis', 'courses'], {
          useNative: true,
          enumName: 'product_category',
          existingType: false,
        })
        .notNullable()
        .index()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS product_status')
    this.schema.raw('DROP TYPE IF EXISTS product_category')
  }
}
