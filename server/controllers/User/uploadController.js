import fs from "node:fs/promises";

import { PASSPORT_SELFIE_UPLOAD_PURPOSE } from "../../constants/privateUploadConstants.js";
import { buildPublicUploadUrl } from "../../services/upload/buildPublicUploadUrl.js";
import { finalizeUploadedFile } from "../../services/upload/finalizeUploadedFile.js";
import { compressUploadedImageFile } from "../../services/upload/compressUploadedImageFile.js";
import { assertUploadedImageMagic } from "../../services/upload/assertUploadedImageMagic.js";
import {
  buildPrivateUploadApiUrl,
  moveUploadFileToPrivateDir,
} from "../../services/upload/privateUploadPaths.js";
import {
  isObjectStorageUploadEnabled,
  persistPrivateUploadToObjectStorage,
} from "../../services/upload/objectStorageUpload.js";
import { successRes, errorRes } from "../../services/http/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * @param {import('express').Request} req
 */
function isPassportSelfieUpload(req) {
  return (
    String(req.query?.purpose ?? "")
      .trim()
      .toLowerCase() === PASSPORT_SELFIE_UPLOAD_PURPOSE
  );
}

/**
 * @param {import('express').Request['file']} file
 */
async function cleanupRejectedUpload(file) {
  if (!file?.path) {
    return;
  }
  try {
    await fs.unlink(file.path);
  } catch {
    // best-effort
  }
}

export async function uploadController(req, res) {
  if (!req.file) {
    return errorRes(
      res,
      400,
      "Файл не загружен или тип не разрешён (только JPEG, PNG, WebP)",
    );
  }

  try {
    await assertUploadedImageMagic(req.file);
  } catch {
    await cleanupRejectedUpload(req.file);
    return errorRes(
      res,
      400,
      "Файл не загружен или тип не разрешён (только JPEG, PNG, WebP)",
    );
  }

  const wantPrivate = isPassportSelfieUpload(req);

  if (wantPrivate) {
    const filename = isObjectStorageUploadEnabled()
      ? await persistPrivateUploadToObjectStorage(req.file)
      : await moveUploadFileToPrivateDir(await finalizeUploadedFile(req.file));

    return successRes(res, {
      url: buildPrivateUploadApiUrl(filename),
      filename,
      originalname: req.file.originalname,
      private: true,
    });
  }

  // Даунскейл + WebP до сохранения. Оптимизация не критична для успеха
  // загрузки: при сбое sharp логируем и сохраняем оригинал как есть.
  try {
    await compressUploadedImageFile(req.file);
  } catch (compressError) {
    logServerEvent("warn", {
      event: "uploadcontroller_compress",
      error:
        compressError instanceof Error
          ? compressError.message
          : String(compressError),
    });
  }

  const filename = await finalizeUploadedFile(req.file);
  const url = buildPublicUploadUrl({ filename });
  return successRes(res, {
    url,
    filename,
    originalname: req.file.originalname,
  });
}
