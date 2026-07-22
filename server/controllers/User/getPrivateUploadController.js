import fs from "node:fs";
import path from "node:path";

import { GetObjectCommand } from "@aws-sdk/client-s3";

import { errorRes } from "../../services/http/index.js";
import { resolveUploadContentType } from "../../utils/resolveUploadContentType.js";
import {
  buildPrivateObjectStorageKey,
  getPrivateUploadBucket,
  getS3Client,
  isObjectStorageUploadEnabled,
} from "../../services/upload/objectStorageUpload.js";
import {
  parsePrivateUploadFilenameFromUrl,
  resolvePrivateUploadDiskPath,
} from "../../services/upload/privateUploadPaths.js";
import { isSafeUploadFilename } from "../../services/upload/parseUploadFilenameFromMediaUrl.js";
import { UPLOADS_DIR } from "../../utils/uploadsDir.js";

/**
 * Staff-only: `GET /upload/private/:filename`
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getPrivateUploadController(req, res) {
  const filename = String(req.params.filename ?? "").trim();
  if (!isSafeUploadFilename(filename)) {
    return errorRes(res, 400, "Некорректное имя файла");
  }

  // Поддержка полного URL в param не нужна — только basename.
  if (parsePrivateUploadFilenameFromUrl(`/upload/private/${filename}`) !== filename) {
    return errorRes(res, 400, "Некорректное имя файла");
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Type", resolveUploadContentType(filename));
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  if (isObjectStorageUploadEnabled()) {
    let bucket;
    try {
      bucket = getPrivateUploadBucket();
    } catch {
      return errorRes(res, 500, "S3-бакет для приватных файлов не задан");
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
        return errorRes(res, 404, "Файл не найден");
      }
      result.Body.pipe(res);
      return undefined;
    } catch (error) {
      if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NoSuchKey") {
        return errorRes(res, 404, "Файл не найден");
      }
      console.error("getPrivateUploadController s3 error:", error);
      return errorRes(res, 500, "Ошибка чтения файла");
    }
  }

  try {
    const filePath = resolvePrivateUploadDiskPath(filename);
    await fs.promises.access(filePath);
    return res.sendFile(path.resolve(filePath));
  } catch {
    // Legacy: URL уже private, файл остался в публичной uploads/
    try {
      const legacyPath = path.resolve(UPLOADS_DIR, filename);
      const uploadsRoot = path.resolve(UPLOADS_DIR);
      if (
        !legacyPath.startsWith(`${uploadsRoot}${path.sep}`) &&
        legacyPath !== uploadsRoot
      ) {
        return errorRes(res, 404, "Файл не найден");
      }
      await fs.promises.access(legacyPath);
      return res.sendFile(legacyPath);
    } catch {
      return errorRes(res, 404, "Файл не найден");
    }
  }
}
