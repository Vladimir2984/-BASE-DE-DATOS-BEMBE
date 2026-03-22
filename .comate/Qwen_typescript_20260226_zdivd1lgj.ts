const [result] = await this.db
  .select()
  .from(agents)
  .where(eq(agents.id, id))
  .limit(1);
return result;