import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import {
  buildObjectStorageKey,
  getS3Client,
  isObjectStorageUploadEnabled,
  objectStorageHasUpload,
} from "../services/upload/objectStorageUpload.js";
import { UPLOADS_DIR } from "../services/upload/uploadsDir.js";

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
};

/**
 * @param {string} filePath
 */
const guessContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
};

const isApply = process.argv.includes("--apply");

async function main() {
  if (!isObjectStorageUploadEnabled()) {
    console.error("UPLOAD_STORAGE=s3 не задан в server/.env");
    process.exit(1);
  }

  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) {
    console.error("S3_BUCKET не задан");
    process.exit(1);
  }

  let entries;
  try {
    entries = await fs.readdir(UPLOADS_DIR, { withFileTypes: true });
  } catch (error) {
    console.error("Не удалось прочитать uploads:", error);
    process.exit(1);
  }

  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  if (files.length === 0) {
    console.log("[sync-uploads] Папка uploads пуста");
    return;
  }

  const client = getS3Client();
  let uploaded = 0;
  let skipped = 0;

  for (const filename of files) {
    const key = buildObjectStorageKey(filename);
    const exists = await objectStorageHasUpload(filename);
    if (exists) {
      skipped += 1;
      console.log(`[skip] ${key} уже в бакете`);
      continue;
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    const body = await fs.readFile(filePath);
    const contentType = guessContentType(filePath);

    if (!isApply) {
      console.log(`[dry-run] upload ${key} (${contentType}, ${body.length} bytes)`);
      uploaded += 1;
      continue;
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    uploaded += 1;
    console.log(`[ok] ${key}`);
  }

  console.log(
    `[sync-uploads] ${isApply ? "APPLY" : "DRY-RUN"}: +${uploaded}, skip ${skipped}, всего файлов ${files.length}`,
  );
  if (!isApply && uploaded > 0) {
    console.log("Повторите с --apply для загрузки");
  }
}

main().catch((error) => {
  console.error("[sync-uploads] FAILED:", error);
  process.exit(1);
});
