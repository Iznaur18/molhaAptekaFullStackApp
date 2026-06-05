import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  UPLOAD_OBJECT_KEY_PREFIX,
  UPLOAD_STORAGE_S3,
} from "../constants/uploadStorageConstants.js";
import { buildUploadFilename } from "./buildUploadFilename.js";

/**
 * @returns {boolean}
 */
export const isObjectStorageUploadEnabled = () =>
  String(process.env.UPLOAD_STORAGE ?? "")
    .trim()
    .toLowerCase() === UPLOAD_STORAGE_S3;

/** @type {S3Client | null} */
let s3Client = null;

const getS3Client = () => {
  if (!s3Client) {
    const endpoint = process.env.S3_ENDPOINT?.trim();
    s3Client = new S3Client({
      region: process.env.S3_REGION?.trim() || "auto",
      ...(endpoint ? { endpoint } : {}),
      credentials: {
        accessKeyId: String(process.env.S3_ACCESS_KEY_ID ?? ""),
        secretAccessKey: String(process.env.S3_SECRET_ACCESS_KEY ?? ""),
      },
      forcePathStyle:
        String(process.env.S3_FORCE_PATH_STYLE ?? "").toLowerCase() === "true",
    });
  }
  return s3Client;
};

export { getS3Client };

/**
 * @param {string} filename
 */
export const buildObjectStorageKey = (filename) =>
  `${UPLOAD_OBJECT_KEY_PREFIX}${filename}`;

/**
 * @param {import('express').Request['file']} file
 */
export const resolveUploadFilename = (file) => {
  const existing = String(file?.filename ?? "").trim();
  if (existing) {
    return existing;
  }
  return buildUploadFilename(file?.mimetype);
};

/**
 * @param {import('express').Request['file']} file
 */
export const persistUploadToObjectStorage = async (file) => {
  const filename = resolveUploadFilename(file);
  const key = buildObjectStorageKey(filename);
  const body = file.buffer;

  if (!body || !Buffer.isBuffer(body)) {
    throw new Error("Object storage upload requires in-memory file buffer");
  }

  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) {
    throw new Error("S3_BUCKET не задан");
  }

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.mimetype || "application/octet-stream",
    }),
  );

  return filename;
};

/**
 * @param {string} filename
 */
export const deleteUploadFromObjectStorage = async (filename) => {
  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) {
    throw new Error("S3_BUCKET не задан");
  }

  const key = buildObjectStorageKey(filename);
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

/**
 * @param {string} filename
 * @returns {Promise<boolean>}
 */
export const objectStorageHasUpload = async (filename) => {
  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) {
    return false;
  }

  try {
    await getS3Client().send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: buildObjectStorageKey(filename),
      }),
    );
    return true;
  } catch (error) {
    const err = /** @type {{ name?: string; Code?: string; $metadata?: { httpStatusCode?: number } }} */ (
      error
    );
    const missing =
      err?.name === "NotFound" ||
      err?.Code === "NotFound" ||
      err?.name === "NoSuchKey" ||
      err?.$metadata?.httpStatusCode === 404;
    if (missing) {
      return false;
    }
    throw error;
  }
};

/**
 * Проверка env для UPLOAD_STORAGE=s3 (production).
 * @returns {{ errors: string[]; warnings: string[] }}
 */
export const validateObjectStorageEnv = () => {
  const errors = [];
  const warnings = [];

  if (!isObjectStorageUploadEnabled()) {
    return { errors, warnings };
  }

  const required = [
    ["S3_BUCKET", process.env.S3_BUCKET],
    ["S3_ACCESS_KEY_ID", process.env.S3_ACCESS_KEY_ID],
    ["S3_SECRET_ACCESS_KEY", process.env.S3_SECRET_ACCESS_KEY],
    ["PUBLIC_UPLOAD_BASE_URL", process.env.PUBLIC_UPLOAD_BASE_URL],
  ];

  for (const [name, value] of required) {
    if (!String(value ?? "").trim()) {
      errors.push(`${name} обязателен при UPLOAD_STORAGE=s3`);
    }
  }

  const endpoint = process.env.S3_ENDPOINT?.trim();
  if (!endpoint) {
    const message =
      "S3_ENDPOINT обязателен при UPLOAD_STORAGE=s3 (R2: https://<account>.r2.cloudflarestorage.com)";
    if (process.env.NODE_ENV === "production") {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  const base = String(process.env.PUBLIC_UPLOAD_BASE_URL ?? "").trim();
  if (base && !base.startsWith("https://")) {
    warnings.push(
      "PUBLIC_UPLOAD_BASE_URL без https:// — CDN для медиа в production должен быть HTTPS",
    );
  }

  return { errors, warnings };
};
