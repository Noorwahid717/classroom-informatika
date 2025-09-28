import Database from "better-sqlite3";
import { writeToPath } from "@fast-csv/format";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlitePath = process.env.SQLITE_DB_PATH ?? path.resolve(__dirname, "../prisma/dev.db");
const outputDir = path.resolve(__dirname, "../.cache/export");
fs.mkdirSync(outputDir, { recursive: true });

const tables = ["users", "classes", "assignments", "submissions", "registrations", "announcements", "events", "gallery_items"];

const db = new Database(sqlitePath, { readonly: true });

tables.forEach((table) => {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  const outputPath = path.join(outputDir, `${table}.csv`);
  writeToPath(outputPath, rows, { headers: true })
    .on("finish", () => console.log(`Exported ${rows.length} rows from ${table}`))
    .on("error", (error) => console.error(`Failed to export ${table}`, error));
});

db.close();
