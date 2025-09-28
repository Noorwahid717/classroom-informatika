import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";
import { parse } from "@fast-csv/parse";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({ connectionString: process.env.DATABASE_URL });
const inputDir = path.resolve(process.cwd(), ".cache/transform");

interface Row {
  [key: string]: string;
}

async function truncateTables() {
  await client.query(
    "TRUNCATE \"RefreshToken\", \"WorkerJob\", \"Grade\", \"Submission\", \"Assignment\", \"ClassMember\", \"Classroom\", \"Announcement\", \"Event\", \"Registration\", \"User\" RESTART IDENTITY CASCADE"
  );
}

async function importCsv(table: string) {
  const filePath = path.join(inputDir, `${table}.csv`);
  if (!fs.existsSync(filePath)) return;

  const rows: Row[] = await new Promise((resolve, reject) => {
    const records: Row[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ headers: true }))
      .on("data", (row: Row) => records.push(row))
      .on("end", () => resolve(records))
      .on("error", reject);
  });

  if (!rows.length) return;

  const columns = Object.keys(rows[0]);
  const values = rows
    .map((row, rowIndex) => `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(",")})`)
    .join(",");
  const flatValues = rows.flatMap((row) => columns.map((col) => row[col] ?? null));
  const query = `INSERT INTO "${table}" (${columns.map((col) => `"${col}"`).join(",")}) VALUES ${values} ON CONFLICT DO NOTHING`;
  await client.query(query, flatValues);
  console.log(`Imported ${rows.length} rows into ${table}`);
}

async function run() {
  await client.connect();
  try {
    await truncateTables();
    const order = [
      "User",
      "Registration",
      "Classroom",
      "ClassMember",
      "Rubric",
      "RubricCriterion",
      "Assignment",
      "Submission",
      "Grade",
      "Announcement",
      "Event",
      "RefreshToken",
      "WorkerJob"
    ];
    for (const table of order) {
      await importCsv(table);
    }
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
