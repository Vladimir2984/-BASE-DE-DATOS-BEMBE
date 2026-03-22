-- ✅ Tablas
CREATE TABLE IF NOT EXISTS "table_name" (...);

-- ✅ Columnas
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" text;
ALTER TABLE "users" DROP COLUMN IF EXISTS "old_field";

-- ✅ Foreign Keys (DROP + ADD, sin IF NOT EXISTS en constraints)
ALTER TABLE "t" DROP CONSTRAINT IF EXISTS "t_fk";
ALTER TABLE "t" ADD CONSTRAINT "t_fk" FOREIGN KEY ("col") REFERENCES "ref"("id") ON DELETE cascade;

-- ✅ Indexes
CREATE INDEX IF NOT EXISTS "idx_name" ON "table" ("column");

-- ❌ NUNCA: SQL no idempotente (fallará en re-ejecución)
CREATE TABLE "table_name" (...);  -- sin IF NOT EXISTS