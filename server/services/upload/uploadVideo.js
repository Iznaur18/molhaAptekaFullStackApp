import { unlink } from "node:fs/promises";

import { AppError } from "../../errors/AppError.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { buildPublicUploadUrl } from "./buildPublicUploadUrl.js";
import { finalizeUploadedFile } from "./finalizeUploadedFile.js";
import { prepareUploadedVideoFile } from "./prepareUploadedVideoFile.js";

const UPLOAD_REJECTED_MESSAGE =
  "Файл не загружен или тип не разрешён (только MP4, WebM, MOV, HEVC)";
const TRANSCODE_FAILED_MESSAGE =
  "Не удалось обработать видео. Загрузите MP4 (H.264) или короче 3 секунд";

/**
 * @param {import('express').Request['file']} file
 */
async function cleanupUploadedOriginal(file) {
  if (!file?.path) {
    return;
  }
  try {
    await unlink(file.path);
  } catch (error) {
    if (/** @type {{ code?: string }} */ (error)?.code !== "ENOENT") {
      logServerEvent("warn", {
        event: "upload.video_cleanup_failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

/**
 * @param {{
 *   file: import('express').Request['file'];
 *   transcodeOptions: unknown;
 * }} args
 */
export async function uploadVideo({ file, transcodeOptions }) {
  if (!file) {
    throw new AppError(400, UPLOAD_REJECTED_MESSAGE);
  }

  try {
    await prepareUploadedVideoFile(file, transcodeOptions);
  } catch (transcodeError) {
    logServerEvent("error", {
      event: "uploadvideocontroller_transcode",
      error:
        transcodeError instanceof Error
          ? transcodeError.message
          : String(transcodeError),
    });
    await cleanupUploadedOriginal(file);
    throw new AppError(400, TRANSCODE_FAILED_MESSAGE);
  }

  const filename = await finalizeUploadedFile(file);
  const url = buildPublicUploadUrl({ filename });

  return {
    url,
    filename,
    originalname: file.originalname,
  };
}
