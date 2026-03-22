const [dataset] = await db.select().from(datasets).where(eq(datasets.id, id)).limit(1);
if (!dataset) return undefined;
const testCases = await db.select().from(testCases).where(eq(testCases.datasetId, id));
return { ...dataset, testCases };