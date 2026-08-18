import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { compressImageToWebp } from "./compressImageBuffer.js";

/**
 * Только растровые фото — SVG/иконочные форматы сюда не попадают (роут /upload
 * их и не принимает), а перегонять их в WebP смысла нет.
 */
const COMPRESSIBLE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/**
 * @returns {boolean}
 */
function isImageCompressionDisabled() {
  return (
    String(process.env.UPLOAD_IMAGE_COMPRESS ?? "")
      .trim()
      .toLowerCase() === "false"
  );
}

/**
 * @param {string} filename
 */
function toWebpFilename(filename) {
  const trimmed = String(filename ?? "").trim();
  if (trimmed === "") {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.webp`;
  }
  return trimmed.replace(/\.[^.]+$/i, ".webp");
}

/**
 * @param {string} filePath
 */
async function safeUnlink(filePath) {
  if (!filePath) return;
  await unlink(filePath).catch(() => {});
}

/**
 * Пост-multer шаг для публичных изображений: даунскейл + WebP. Мутирует и
 * возвращает тот же `file` (как `prepareUploadedVideoFile`), чтобы дальше
 * `finalizeUploadedFile` подхватил новые filename/buffer как в дисковом, так и
 * в S3-режиме.
 *
 * Если сжатие отключено, файл не картинка или WebP получился не легче —
 * возвращаем оригинал без изменений (upload не должен падать из-за оптимизации).
 *
 * @param {import('express').Multer.File} file
 * @returns {Promise<import('express').Multer.File>}
 */
export async function compressUploadedImageFile(file) {
  if (!file) {
    throw new Error("Файл не передан");
  }

  if (isImageCompressionDisabled()) {
    return file;
  }

  if (!COMPRESSIBLE_MIME.has(String(file.mimetype ?? "").toLowerCase())) {
    return file;
  }

  const inputBuffer = file.path ? await readFile(file.path) : file.buffer;
  if (!Buffer.isBuffer(inputBuffer) || inputBuffer.length === 0) {
    return file;
  }

  const compressed = await compressImageToWebp(inputBuffer);
  if (!compressed) {
    return file;
  }

  const nextFilename = toWebpFilename(file.filename);

  if (file.path) {
    const nextPath = path.join(path.dirname(file.path), nextFilename);
    await writeFile(nextPath, compressed);
    if (nextPath !== file.path) {
      await safeUnlink(file.path);
    }
    file.path = nextPath;
  }

  file.buffer = compressed;
  file.size = compressed.length;
  file.mimetype = "image/webp";
  file.filename = nextFilename;
  file.originalname = String(file.originalname ?? "image.webp").replace(
    /\.[^.]+$/i,
    ".webp",
  );

  return file;
}
