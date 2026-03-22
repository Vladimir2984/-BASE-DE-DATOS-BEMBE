const rows = await this.db
  .select({ runId: t1.runId, score: t1.score, testCase: t2, topic: t3 })
  .from(agentEvalRunTopics)
  .leftJoin(agentEvalTestCases, eq(t1.testCaseId, t2.id))
  .leftJoin(topics, eq(t1.topicId, t3.id))
  .where(eq(t1.runId, runId))
  .orderBy(asc(t1.createdAt));