import fs from "node:fs/promises";
import path from "node:path";

import {
  PRIVATE_UPLOAD_API_PATH_PREFIX,
  PRIVATE_UPLOAD_SUBDIR,
} from "../../constants/privateUploadConstants.js";
import { isSafeUploadFilename } from "./parseUploadFilenameFromMediaUrl.js";
import { UPLOADS_DIR } from "./uploadsDir.js";

/**
 * @param {string} filename
 * @returns {string}
 */
export function buildPrivateUploadApiUrl(filename) {
  return `${PRIVATE_UPLOAD_API_PATH_PREFIX}${filename}`;
}

/**
 * @param {string | null | undefined} mediaUrl
 * @returns {string | null}
 */
export function parsePrivateUploadFilenameFromUrl(mediaUrl) {
  const match = String(mediaUrl ?? "").match(/\/upload\/private\/([^?#/]+)/i);
  const filename = match?.[1] ?? null;
  if (!filename || !isSafeUploadFilename(filename)) {
    return null;
  }
  return filename;
}

/**
 * Переносит уже сохранённый multer-файл в `uploads/private/`.
 *
 * @param {string} filename
 * @returns {Promise<string>} basename
 */
export async function moveUploadFileToPrivateDir(filename) {
  if (!isSafeUploadFilename(filename)) {
    throw new Error("Некорректное имя файла");
  }

  const privateDir = path.join(UPLOADS_DIR, PRIVATE_UPLOAD_SUBDIR);
  await fs.mkdir(privateDir, { recursive: true });

  const sourcePath = path.resolve(UPLOADS_DIR, filename);
  const destPath = path.resolve(privateDir, filename);
  const uploadsRoot = path.resolve(UPLOADS_DIR);
  if (
    !sourcePath.startsWith(`${uploadsRoot}${path.sep}`) &&
    sourcePath !== uploadsRoot
  ) {
    throw new Error("Некорректный путь загрузки");
  }

  await fs.rename(sourcePath, destPath);
  return filename;
}

/**
 * @param {string} filename
 * @returns {string}
 */
export function resolvePrivateUploadDiskPath(filename) {
  if (!isSafeUploadFilename(filename)) {
    throw new Error("Некорректное имя файла");
  }
  const privateDir = path.resolve(UPLOADS_DIR, PRIVATE_UPLOAD_SUBDIR);
  const filePath = path.resolve(privateDir, filename);
  if (!filePath.startsWith(`${privateDir}${path.sep}`) && filePath !== privateDir) {
    throw new Error("Некорректный путь");
  }
  return filePath;
}
