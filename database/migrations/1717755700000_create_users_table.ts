import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('full_name', 160).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('phone', 32).nullable()
      table.string('password', 255).nullable()
      table
        .enum('role', ['client', 'driver', 'vendor', 'admin'], {
          useNative: true,
          enumName: 'user_role',
          existingType: false,
        })
        .notNullable()
        .defaultTo('client')
        .index()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS user_role')
  }
}
