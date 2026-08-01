import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  UPLOAD_OBJECT_KEY_PREFIX,
  UPLOAD_STORAGE_S3,
} from "../../constants/uploadStorageConstants.js";
import { buildS3ServerSideEncryptionParams } from "./buildS3ServerSideEncryptionParams.js";
import { buildUploadFilename } from "./buildUploadFilename.js";
import { resolveUploadContentType } from "./resolveUploadContentType.js";

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
 * Публичный бакет (раздаётся через CDN, `PUBLIC_UPLOAD_BASE_URL`).
 * @returns {string}
 */
export const getPublicUploadBucket = () => {
  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) {
    throw new Error("S3_BUCKET не задан");
  }
  return bucket;
};

/**
 * Бакет для приватных PII-файлов (селфи паспорта). ДОЛЖЕН быть отдельным
 * НЕпубличным бакетом, не за CDN — иначе `uploads/private/*` утекает по
 * прямой ссылке в обход auth+ACL. Fallback на публичный бакет — только для
 * dev/обратной совместимости; prod-preflight требует `S3_PRIVATE_BUCKET`,
 * отличный от `S3_BUCKET` (см. `validateObjectStorageEnv`).
 * @returns {string}
 */
export const getPrivateUploadBucket = () => {
  const priv = process.env.S3_PRIVATE_BUCKET?.trim();
  if (priv) {
    return priv;
  }
  return getPublicUploadBucket();
};

/**
 * @param {string} filename
 */
export const buildObjectStorageKey = (filename) =>
  `${UPLOAD_OBJECT_KEY_PREFIX}${filename}`;

/**
 * @param {string} filename
 */
export const buildPrivateObjectStorageKey = (filename) =>
  `${UPLOAD_OBJECT_KEY_PREFIX}private/${filename}`;

/**
 * @param {import('express').Request['file']} file
 */
export const resolveUploadFilename = (file) => {
  const existing = String(file?.filename ?? "").trim();
  if (existing) {
    return existing;
  }
  return buildUploadFilename(file);
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

  const bucket = getPublicUploadBucket();

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: resolveUploadContentType(filename, file.mimetype),
      ...buildS3ServerSideEncryptionParams(),
    }),
  );

  return filename;
};

/**
 * Чувствительные файлы (passport selfie) — ключ `uploads/private/{filename}`
 * в ОТДЕЛЬНОМ непубличном бакете (`S3_PRIVATE_BUCKET`), не за CDN.
 *
 * @param {import('express').Request['file']} file
 */
export const persistPrivateUploadToObjectStorage = async (file) => {
  const filename = resolveUploadFilename(file);
  const key = buildPrivateObjectStorageKey(filename);
  const body = file.buffer;

  if (!body || !Buffer.isBuffer(body)) {
    throw new Error("Object storage upload requires in-memory file buffer");
  }

  const bucket = getPrivateUploadBucket();

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: resolveUploadContentType(filename, file.mimetype),
      ...buildS3ServerSideEncryptionParams(),
    }),
  );

  return filename;
};

/**
 * @param {string} filename
 */
export const deleteUploadFromObjectStorage = async (filename) => {
  const bucket = getPublicUploadBucket();

  const key = buildObjectStorageKey(filename);
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

/**
 * Удаление приватного файла из непубличного бакета (`S3_PRIVATE_BUCKET`).
 * @param {string} filename
 */
export const deletePrivateUploadFromObjectStorage = async (filename) => {
  const bucket = getPrivateUploadBucket();

  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: buildPrivateObjectStorageKey(filename),
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
    const err =
      /** @type {{ name?: string; Code?: string; $metadata?: { httpStatusCode?: number } }} */ (
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

  // Приватный бакет для PII (селфи паспорта) должен быть отдельным и НЕ за CDN.
  const publicBucket = String(process.env.S3_BUCKET ?? "").trim();
  const privateBucket = String(process.env.S3_PRIVATE_BUCKET ?? "").trim();
  if (!privateBucket) {
    const message =
      "S3_PRIVATE_BUCKET не задан — приватные PII-файлы (селфи паспорта) попадут в публичный CDN-бакет и утекут по прямой ссылке. Заведите отдельный непубличный бакет.";
    if (process.env.NODE_ENV === "production") {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  } else if (publicBucket && privateBucket === publicBucket) {
    errors.push(
      "S3_PRIVATE_BUCKET совпадает с S3_BUCKET — приватные файлы окажутся в публичном CDN-бакете. Нужен отдельный непубличный бакет.",
    );
  }

  const base = String(process.env.PUBLIC_UPLOAD_BASE_URL ?? "").trim();
  if (base && !base.startsWith("https://")) {
    warnings.push(
      "PUBLIC_UPLOAD_BASE_URL без https:// — CDN для медиа в production должен быть HTTPS",
    );
  }

  const sse = String(process.env.S3_SERVER_SIDE_ENCRYPTION ?? "").trim();
  if (process.env.NODE_ENV === "production" && !sse) {
    warnings.push(
      "S3_SERVER_SIDE_ENCRYPTION не задан — для AWS S3 задайте AES256 (или aws:kms); Cloudflare R2 шифрует at rest по умолчанию",
    );
  }

  return { errors, warnings };
};
