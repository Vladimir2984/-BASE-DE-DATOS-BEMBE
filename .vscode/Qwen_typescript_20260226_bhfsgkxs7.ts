userId: text('user_id')
  .references(() => users.id, { onDelete: 'cascade' })
  .notNull()