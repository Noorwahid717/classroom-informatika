import { S3Client, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.STORAGE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.STORAGE_R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.STORAGE_R2_SECRET_ACCESS_KEY ?? ""
  }
});

const bucket = process.env.STORAGE_R2_BUCKET ?? "classroom";
const sourceDir = process.env.LEGACY_ASSETS_DIR ?? path.resolve(process.cwd(), "legacy-assets");

async function checksum(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function uploadFile(filePath: string, key: string) {
  const body = fs.createReadStream(filePath);
  const uploader = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "application/octet-stream"
    }
  });
  await uploader.done();
}

async function exists(key: string, expectedChecksum: string) {
  try {
    const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return result.Metadata?.checksum === expectedChecksum;
  } catch (error) {
    return false;
  }
}

async function run() {
  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    if (!fs.statSync(filePath).isFile()) continue;
    const key = `legacy/${file}`;
    const fileChecksum = await checksum(filePath);
    const alreadyUploaded = await exists(key, fileChecksum);
    if (alreadyUploaded) {
      console.log(`Skipping ${file}, checksum match`);
      continue;
    }
    await uploadFile(filePath, key);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Metadata: {
          checksum: fileChecksum
        }
      })
    );
    console.log(`Uploaded ${file} -> ${key}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
