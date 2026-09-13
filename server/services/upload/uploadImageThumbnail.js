import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  UPLOAD_IMAGE_THUMBNAIL_MAX_DIM,
  buildUploadImageThumbnailFilename,
  isUploadImageThumbnailFilename,
} from "@izibuy/shared-lib";
import sharp from "sharp";

import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  deleteUploadFromObjectStorage,
  isObjectStorageUploadEnabled,
  persistUploadToObjectStorage,
} from "./objectStorageUpload.js";
import { UPLOADS_DIR } from "./uploadsDir.js";

/**
 * Превью фото для ленты: `<имя>-w600.webp` рядом с оригиналом (правило имени —
 * `@izibuy/shared-lib`). Клиент грузит превью в сетке и откатывается на
 * оригинал, если превью нет.
 */
export const UPLOAD_IMAGE_THUMBNAIL_WEBP_QUALITY = 75;

/**
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {unknown} error
 */
const toErrorMessage = (error) =>
  error instanceof Error ? error.message : String(error);

/**
 * Даунскейл до 600 px по длинной стороне (без увеличения мелких) + WebP.
 *
 * @param {Buffer} inputBuffer
 * @returns {Promise<Buffer>}
 */
export async function renderUploadImageThumbnail(inputBuffer) {
  return sharp(inputBuffer, { failOn: "none" })
    .rotate()
    .resize({
      width: UPLOAD_IMAGE_THUMBNAIL_MAX_DIM,
      height: UPLOAD_IMAGE_THUMBNAIL_MAX_DIM,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: UPLOAD_IMAGE_THUMBNAIL_WEBP_QUALITY })
    .toBuffer();
}

/**
 * Создать превью ПУБЛИЧНОГО фото. Звать только у публичных загрузок после
 * `finalizeUploadedFile`: приватные файлы (селфи с паспортом, документы
 * курьера) тоже проходят через finalize, и их превью оказалось бы в открытом
 * `/uploads`.
 *
 * Превью пишется всегда, даже для маленьких фото: клиент в сетке запрашивает
 * превью без проверки размера оригинала.
 *
 * @param {{
 *   filename: string;
 *   buffer?: Buffer | null;
 *   filePath?: string | null;
 *   uploadsDir?: string;
 * }} params
 * @returns {Promise<string | null>} имя превью или `null`, если превью не бывает
 */
export async function createPublicUploadImageThumbnail({
  filename,
  buffer = null,
  filePath = null,
  uploadsDir = UPLOADS_DIR,
}) {
  const thumbnailFilename = buildUploadImageThumbnailFilename(filename);
  if (!thumbnailFilename) {
    return null;
  }

  const input =
    Buffer.isBuffer(buffer) && buffer.length > 0
      ? buffer
      : filePath
        ? await readFile(filePath)
        : null;
  if (!input || input.length === 0) {
    return null;
  }

  const output = await renderUploadImageThumbnail(input);

  if (isObjectStorageUploadEnabled()) {
    await persistUploadToObjectStorage({
      filename: thumbnailFilename,
      buffer: output,
      mimetype: "image/webp",
    });
  } else {
    await writeFile(path.join(uploadsDir, thumbnailFilename), output);
  }

  return thumbnailFilename;
}

/**
 * То же, но сбой не роняет загрузку: превью — оптимизация, клиент покажет
 * оригинал.
 *
 * @param {Parameters<typeof createPublicUploadImageThumbnail>[0]} params
 * @returns {Promise<string | null>}
 */
export async function createPublicUploadImageThumbnailSafe(params) {
  try {
    return await createPublicUploadImageThumbnail(params);
  } catch (error) {
    logServerEvent("warn", {
      event: "upload_image_thumbnail_failed",
      filename: params?.filename ?? null,
      error: toErrorMessage(error),
    });
    return null;
  }
}

/**
 * Удалить превью вместе с оригиналом. Отсутствие превью — не ошибка
 * (старое фото до бэкфила).
 *
 * @param {string} filename имя ОРИГИНАЛА
 * @param {{ uploadsDir?: string }} [options]
 */
export async function deletePublicUploadImageThumbnail(
  filename,
  { uploadsDir = UPLOADS_DIR } = {},
) {
  const thumbnailFilename = buildUploadImageThumbnailFilename(filename);
  if (!thumbnailFilename) {
    return;
  }

  try {
    if (isObjectStorageUploadEnabled()) {
      await deleteUploadFromObjectStorage(thumbnailFilename);
      return;
    }
    await unlink(path.join(uploadsDir, thumbnailFilename));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return;
    }
    logServerEvent("warn", {
      event: "upload_image_thumbnail_delete_failed",
      filename: thumbnailFilename,
      error: toErrorMessage(error),
    });
  }
}

/**
 * Бэкфил на диске: превью для фото, у которых его ещё нет. По одному файлу —
 * VPS слабый, сайт в это время работает. Каталог `private/` не читается (без
 * рекурсии). Перезапуск безопасен: готовые превью пропускаются.
 *
 * @param {{
 *   apply?: boolean;
 *   limit?: number;
 *   pauseMs?: number;
 *   uploadsDir?: string;
 *   onProgress?: (summary: BackfillSummary) => void;
 * }} [options]
 * @returns {Promise<BackfillSummary>}
 *
 * @typedef {{
 *   candidates: number;
 *   created: number;
 *   skippedExisting: number;
 *   failed: number;
 *   bytesWritten: number;
 *   failures: Array<{ name: string; error: string }>;
 * }} BackfillSummary
 */
export async function backfillUploadImageThumbnailsOnDisk({
  apply = false,
  limit = Number.POSITIVE_INFINITY,
  pauseMs = 0,
  uploadsDir = UPLOADS_DIR,
  onProgress,
} = {}) {
  const entries = await readdir(uploadsDir, { withFileTypes: true });
  const fileNames = new Set(
    entries.filter((entry) => entry.isFile()).map((entry) => entry.name),
  );

  /** @type {BackfillSummary} */
  const summary = {
    candidates: 0,
    created: 0,
    skippedExisting: 0,
    failed: 0,
    bytesWritten: 0,
    failures: [],
  };

  for (const name of [...fileNames].sort()) {
    if (isUploadImageThumbnailFilename(name)) {
      continue;
    }
    const thumbnailFilename = buildUploadImageThumbnailFilename(name);
    if (!thumbnailFilename) {
      continue;
    }
    if (fileNames.has(thumbnailFilename)) {
      summary.skippedExisting += 1;
      continue;
    }
    if (summary.candidates >= limit) {
      break;
    }

    summary.candidates += 1;
    if (!apply) {
      continue;
    }

    try {
      const output = await renderUploadImageThumbnail(
        await readFile(path.join(uploadsDir, name)),
      );
      await writeFile(path.join(uploadsDir, thumbnailFilename), output);
      summary.created += 1;
      summary.bytesWritten += output.length;
    } catch (error) {
      summary.failed += 1;
      if (summary.failures.length < 20) {
        summary.failures.push({ name, error: toErrorMessage(error) });
      }
    }

    onProgress?.(summary);
    if (pauseMs > 0) {
      await sleep(pauseMs);
    }
  }

  return summary;
}
