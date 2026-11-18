import fs from "node:fs";
import path from "node:path";

import { GetObjectCommand } from "@aws-sdk/client-s3";

import { AppError } from "../../errors/AppError.js";
import { resolveUploadContentType } from "../../utils/resolveUploadContentType.js";
import { UPLOADS_DIR } from "../../utils/uploadsDir.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  buildPrivateObjectStorageKey,
  getPrivateUploadBucket,
  getS3Client,
  isObjectStorageUploadEnabled,
} from "./objectStorageUpload.js";
import {
  parsePrivateUploadFilenameFromUrl,
  resolvePrivateUploadDiskPath,
} from "./privateUploadPaths.js";
import { isSafeUploadFilename } from "./parseUploadFilenameFromMediaUrl.js";

/**
 * Staff-only private file stream. Пишет в `res` сам (pipe/sendFile).
 *
 * @param {{
 *   filenameRaw: unknown;
 *   res: import('express').Response;
 * }} args
 */
export async function streamPrivateUpload({ filenameRaw, res }) {
  const filename = String(filenameRaw ?? "").trim();
  if (!isSafeUploadFilename(filename)) {
    throw new AppError(400, "Некорректное имя файла");
  }

  if (parsePrivateUploadFilenameFromUrl(`/upload/private/${filename}`) !== filename) {
    throw new AppError(400, "Некорректное имя файла");
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Type", resolveUploadContentType(filename));
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  if (isObjectStorageUploadEnabled()) {
    let bucket;
    try {
      bucket = getPrivateUploadBucket();
    } catch {
      throw new AppError(500, "S3-бакет для приватных файлов не задан");
    }

    try {
      const result = await getS3Client().send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: buildPrivateObjectStorageKey(filename),
        }),
      );
      if (result.ContentType) {
        res.setHeader("Content-Type", result.ContentType);
      }
      if (!result.Body) {
        throw new AppError(404, "Файл не найден");
      }
      result.Body.pipe(res);
      return;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NoSuchKey") {
        throw new AppError(404, "Файл не найден");
      }
      logServerEvent("error", {
        event: "getprivateuploadcontroller_s3",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new AppError(500, "Ошибка чтения файла");
    }
  }

  try {
    const filePath = resolvePrivateUploadDiskPath(filename);
    await fs.promises.access(filePath);
    res.sendFile(path.resolve(filePath));
    return;
  } catch {
    // Legacy: URL уже private, файл остался в публичной uploads/
    const legacyPath = path.resolve(UPLOADS_DIR, filename);
    const uploadsRoot = path.resolve(UPLOADS_DIR);
    if (
      !legacyPath.startsWith(`${uploadsRoot}${path.sep}`) &&
      legacyPath !== uploadsRoot
    ) {
      throw new AppError(404, "Файл не найден");
    }
    try {
      await fs.promises.access(legacyPath);
    } catch {
      throw new AppError(404, "Файл не найден");
    }
    res.sendFile(legacyPath);
  }
}
