import fs from "node:fs/promises";

import {
  COURIER_DOCUMENT_MAX_DIM,
  COURIER_DOCUMENT_WEBP_QUALITY,
  COURIER_DOCUMENT_UPLOAD_PURPOSE,
  PASSPORT_SELFIE_UPLOAD_PURPOSE,
} from "../../constants/privateUploadConstants.js";
import { AppError } from "../../errors/AppError.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { buildPublicUploadUrl } from "./buildPublicUploadUrl.js";
import { finalizeUploadedFile } from "./finalizeUploadedFile.js";
import { compressUploadedImageFile } from "./compressUploadedImageFile.js";
import { assertUploadedImageMagic } from "./assertUploadedImageMagic.js";
import {
  buildPrivateUploadApiUrl,
  moveUploadFileToPrivateDir,
} from "./privateUploadPaths.js";
import {
  isObjectStorageUploadEnabled,
  persistPrivateUploadToObjectStorage,
} from "./objectStorageUpload.js";
import { rememberPrivateUploadOwner } from "./privateUploadOwnership.js";
import { createPublicUploadImageThumbnailSafe } from "./uploadImageThumbnail.js";

const UPLOAD_REJECTED_MESSAGE =
  "Файл не загружен или тип не разрешён (только JPEG, PNG, WebP)";

/**
 * @param {import('express').Request['file']} file
 */
async function cleanupRejectedUpload(file) {
  if (!file?.path) {
    return;
  }
  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (/** @type {{ code?: string }} */ (error)?.code !== "ENOENT") {
      logServerEvent("warn", {
        event: "upload.rejected_cleanup_failed",
        ...formatLogError(error),
      });
    }
  }
}

/**
 * @param {unknown} purposeRaw
 */
function resolveUploadPurpose(purposeRaw) {
  return String(purposeRaw ?? "")
    .trim()
    .toLowerCase();
}

/**
 * @param {{
 *   file: import('express').Request['file'];
 *   uploaderId: string;
 *   purpose?: unknown;
 * }} args
 */
export async function uploadImage({ file, uploaderId, purpose: purposeRaw }) {
  if (!file) {
    throw new AppError(400, UPLOAD_REJECTED_MESSAGE);
  }

  try {
    await assertUploadedImageMagic(file);
  } catch {
    await cleanupRejectedUpload(file);
    throw new AppError(400, UPLOAD_REJECTED_MESSAGE);
  }

  const purpose = resolveUploadPurpose(purposeRaw);
  const isCourierDocument = purpose === COURIER_DOCUMENT_UPLOAD_PURPOSE;
  const wantPrivate = purpose === PASSPORT_SELFIE_UPLOAD_PURPOSE || isCourierDocument;

  if (wantPrivate) {
    if (isCourierDocument) {
      try {
        await compressUploadedImageFile(file, {
          maxDim: COURIER_DOCUMENT_MAX_DIM,
          quality: COURIER_DOCUMENT_WEBP_QUALITY,
        });
      } catch (compressError) {
        logServerEvent("error", {
          event: "courier_document_compress_failed",
          error:
            compressError instanceof Error
              ? compressError.message
              : String(compressError),
        });
      }
    }

    const filename = isObjectStorageUploadEnabled()
      ? await persistPrivateUploadToObjectStorage(file)
      : await moveUploadFileToPrivateDir(await finalizeUploadedFile(file));

    await rememberPrivateUploadOwner({
      filename,
      uploaderId: String(uploaderId),
      purpose,
    });

    return {
      url: buildPrivateUploadApiUrl(filename),
      filename,
      originalname: file.originalname,
      private: true,
    };
  }

  try {
    await compressUploadedImageFile(file);
  } catch (compressError) {
    logServerEvent("warn", {
      event: "uploadcontroller_compress",
      error:
        compressError instanceof Error ? compressError.message : String(compressError),
    });
  }

  const filename = await finalizeUploadedFile(file);
  await createPublicUploadImageThumbnailSafe({
    filename,
    buffer: file.buffer,
    filePath: file.path,
  });
  const url = buildPublicUploadUrl({ filename });
  return {
    url,
    filename,
    originalname: file.originalname,
  };
}
