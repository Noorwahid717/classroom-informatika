import fs from "node:fs";
import path from "node:path";
import { parse } from "@fast-csv/parse";
import { writeToPath } from "@fast-csv/format";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.resolve(__dirname, "../.cache/export");
const outputDir = path.resolve(__dirname, "../.cache/transform");
fs.mkdirSync(outputDir, { recursive: true });

interface Row {
  [key: string]: string;
}

const transformers: Record<string, (row: Row) => Row> = {
  users: (row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role?.toUpperCase() ?? "STUDENT",
    passwordHash: row.password_hash,
    googleId: row.google_id,
    needsPasswordRehash: row.password_hash ? "true" : "false",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }),
  registrations: (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    programId: row.program_id ?? "general",
    motivation: row.motivation ?? "",
    status: row.status?.toUpperCase() ?? "PENDING",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }),
  announcements: (row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    body: row.body,
    published: row.published ?? "false",
    publishedAt: row.published_at,
    authorId: process.env.DEFAULT_ADMIN_ID ?? row.author_id ?? process.env.FALLBACK_ADMIN_ID ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })
};

fs.readdirSync(inputDir).forEach((file) => {
  const table = file.replace(/\.csv$/, "");
  const transformer = transformers[table];
  const records: Row[] = [];
  fs.createReadStream(path.join(inputDir, file))
    .pipe(parse({ headers: true }))
    .on("data", (row: Row) => {
      records.push(transformer ? transformer(row) : row);
    })
    .on("end", () => {
      const output = path.join(outputDir, file);
      writeToPath(output, records, { headers: true })
        .on("finish", () => console.log(`Transformed ${records.length} rows for ${table}`));
    });
});
