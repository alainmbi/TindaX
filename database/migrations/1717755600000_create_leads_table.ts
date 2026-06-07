import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('category', 40).notNullable().index()
      table.string('source', 80).notNullable().index()
      table.string('full_name', 160).nullable()
      table.string('email', 255).nullable().index()
      table.string('phone', 32).nullable()
      table.string('profile', 50).nullable().index()
      table.string('service_query', 255).nullable()
      table.text('message').nullable()
      table.boolean('newsletter_opt_in').notNullable().defaultTo(false)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
