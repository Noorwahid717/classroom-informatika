import { Client } from "pg";
import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function count(table: string) {
  const result = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
  return result.rows[0].count as number;
}

async function checksum(table: string, column: string) {
  const result = await client.query(`SELECT COALESCE(string_agg(${column}::text, '' ORDER BY ${column}), '') AS hash FROM "${table}"`);
  const hash = crypto.createHash("sha256");
  hash.update(result.rows[0].hash);
  return hash.digest("hex");
}

async function run() {
  await client.connect();
  const tables = ["User", "Classroom", "Assignment", "Submission", "Grade", "Registration"];
  const summary = [] as Array<{ table: string; count: number; checksum: string }>;
  for (const table of tables) {
    const tableCount = await count(table);
    const tableChecksum = await checksum(table, 'id');
    summary.push({ table, count: tableCount, checksum: tableChecksum });
  }
  await client.end();
  console.table(summary);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
