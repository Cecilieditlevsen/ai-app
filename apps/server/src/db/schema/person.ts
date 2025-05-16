import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const person = sqliteTable('person', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  position: text('position'),
  fact: text('fact'),
})
