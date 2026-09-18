import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { PRIVATE_UPLOAD_SUBDIR } from "../constants/privateUploadConstants.js";
import { PUBLIC_UPLOAD_CACHE_CONTROL } from "../constants/uploadStorageConstants.js";
import { buildS3ServerSideEncryptionParams } from "../services/upload/buildS3ServerSideEncryptionParams.js";

import {
  buildObjectStorageKey,
  buildPrivateObjectStorageKey,
  getPrivateUploadBucket,
  getS3Client,
  isObjectStorageUploadEnabled,
  objectStorageHasPrivateUpload,
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
  ".pdf": "application/pdf",
};

/** Приватные файлы (селфи с паспортом, документы курьера) лежат здесь. */
const PRIVATE_UPLOADS_DIR = path.join(UPLOADS_DIR, PRIVATE_UPLOAD_SUBDIR);

/**
 * @param {string} filePath
 */
const guessContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
};

const isApply = process.argv.includes("--apply");

/**
 * Файлы верхнего уровня каталога; вложенные папки не читаются.
 * @param {string} dir
 * @returns {Promise<string[] | null>} null — каталога нет
 */
async function listFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch (error) {
    if (/** @type {{ code?: string }} */ (error).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * @param {{
 *   label: string;
 *   dir: string;
 *   files: string[];
 *   bucket: string;
 *   buildKey: (filename: string) => string;
 *   hasObject: (filename: string) => Promise<boolean>;
 *   extraParams: Record<string, string>;
 * }} input
 */
async function syncFiles({
  label,
  dir,
  files,
  bucket,
  buildKey,
  hasObject,
  extraParams,
}) {
  const client = getS3Client();
  let uploaded = 0;
  let skipped = 0;

  for (const filename of files) {
    const key = buildKey(filename);
    if (await hasObject(filename)) {
      skipped += 1;
      continue;
    }

    const filePath = path.join(dir, filename);
    const body = await fs.readFile(filePath);
    const contentType = guessContentType(filePath);

    if (!isApply) {
      console.log(`[dry-run] ${label}: ${key} (${contentType}, ${body.length} bytes)`);
      uploaded += 1;
      continue;
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ...extraParams,
        ...buildS3ServerSideEncryptionParams(),
      }),
    );
    uploaded += 1;
    console.log(`[ok] ${label}: ${key}`);
  }

  console.log(
    `[sync-uploads] ${label} ${isApply ? "APPLY" : "DRY-RUN"}: +${uploaded}, уже в бакете ${skipped}, всего ${files.length}`,
  );
  return uploaded;
}

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

  const publicFiles = await listFiles(UPLOADS_DIR);
  if (publicFiles === null) {
    console.error(`Нет каталога uploads: ${UPLOADS_DIR}`);
    process.exit(1);
  }

  let pending = await syncFiles({
    label: "public",
    dir: UPLOADS_DIR,
    files: publicFiles,
    bucket,
    buildKey: buildObjectStorageKey,
    hasObject: objectStorageHasUpload,
    extraParams: { CacheControl: PUBLIC_UPLOAD_CACHE_CONTROL },
  });

  const privateFiles = await listFiles(PRIVATE_UPLOADS_DIR);
  if (privateFiles && privateFiles.length > 0) {
    const privateBucket = getPrivateUploadBucket();
    // Селфи с паспортом в публичном бакете за CDN открылись бы по прямой ссылке.
    if (privateBucket === bucket) {
      console.error(
        "S3_PRIVATE_BUCKET не задан или совпадает с S3_BUCKET — приватные файлы не переносятся.",
      );
      process.exit(1);
    }
    pending += await syncFiles({
      label: "private",
      dir: PRIVATE_UPLOADS_DIR,
      files: privateFiles,
      bucket: privateBucket,
      buildKey: buildPrivateObjectStorageKey,
      hasObject: objectStorageHasPrivateUpload,
      extraParams: {},
    });
  }

  if (!isApply && pending > 0) {
    console.log("Повторите с --apply для загрузки");
  }
}

main().catch((error) => {
  console.error("[sync-uploads] FAILED:", error);
  process.exit(1);
});
