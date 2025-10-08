import { readFileSync } from "node:fs";
import path from "node:path";
import { newDb } from "pg-mem";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export async function createTestPrisma(): Promise<PrismaClient> {
  const schemaPath = path.resolve(process.cwd(), "prisma/test-schema.sql");
  const schemaSql = readFileSync(schemaPath, "utf-8");
  const db = newDb({ autoCreateForeignKeyIndices: true });
  db.public.none(schemaSql);
  const adapter = new PrismaPg(db.adapters.createPg());
  return new PrismaClient({ adapter });
}
