export const agents = pgTable(
  'agents',
  {
    id: text('id').primaryKey().$defaultFn(() => idGenerator('agents')).notNull(),
    slug: varchar('slug', { length: 100 }).$defaultFn(() => randomSlug(4)).unique(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    clientId: text('client_id'),
    chatConfig: jsonb('chat_config').$type<LobeAgentChatConfig>(),
    ...timestamps,
  },
  (t) => [uniqueIndex('client_id_user_id_unique').on(t.clientId, t.userId)],
);