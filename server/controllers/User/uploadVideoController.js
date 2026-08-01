import { unlink } from "node:fs/promises";

import { buildPublicUploadUrl } from "../../services/upload/buildPublicUploadUrl.js";
import { finalizeUploadedFile } from "../../services/upload/finalizeUploadedFile.js";
import { prepareUploadedVideoFile } from "../../services/upload/prepareUploadedVideoFile.js";
import { resolveVideoUploadProfile } from "../../services/upload/resolveVideoUploadProfile.js";
import { successRes, errorRes } from "../../services/http/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Оригинал не должен оставаться на диске, если перекодировка не удалась.
 *
 * @param {import('express').Request['file']} file
 */
async function cleanupUploadedOriginal(file) {
  if (file?.path) {
    await unlink(file.path).catch(() => {});
  }
}

export async function uploadVideoController(req, res) {
  if (!req.file) {
    return errorRes(
      res,
      400,
      "Файл не загружен или тип не разрешён (только MP4, WebM, MOV, HEVC)",
    );
  }

  try {
    await prepareUploadedVideoFile(
      req.file,
      resolveVideoUploadProfile(req).transcodeOptions,
    );
  } catch (transcodeError) {
    logServerEvent("error", {
      event: "uploadvideocontroller_transcode",
      error:
        transcodeError instanceof Error
          ? transcodeError.message
          : String(transcodeError),
    });
    await cleanupUploadedOriginal(req.file);
    return errorRes(
      res,
      400,
      "Не удалось обработать видео. Загрузите MP4 (H.264) или короче 3 секунд",
    );
  }

  const filename = await finalizeUploadedFile(req.file);
  const url = buildPublicUploadUrl({ filename });

  return successRes(res, {
    url,
    filename,
    originalname: req.file.originalname,
  });
}
