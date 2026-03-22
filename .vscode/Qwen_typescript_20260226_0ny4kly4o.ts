export const insertSchema = createInsertSchema(table);
export type NewItem = typeof table.$inferInsert;
export type Item = typeof table.$inferSelect;