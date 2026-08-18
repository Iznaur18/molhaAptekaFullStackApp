import { STORY_UPLOAD_VIDEO_MAX_BYTES } from "../../../shared/config/uploadConstants.js";
import { VIDEO_URL_FIELD_UI } from "../../../shared/config/appUiCopy.js";
import { buildUploadVideoSizeError } from "../../../shared/lib/formatUploadBytesAsMb.js";
import { isAllowedUploadVideoFile } from "../../../shared/lib/isAllowedUploadVideoFile.js";

/**
 * Превью товара: проверяем только тип и щедрый лимит ИСХОДНИКА (как intro/story
 * — 100 МБ). Длительность НЕ отклоняем: загрузка идёт с `purpose=product-preview`,
 * и сервер сам обрезает до 3 сек и пережимает (H.264, пик 2 Мбит). Оригинал на
 * диске не хранится — итоговый файл заведомо укладывается в лимит.
 *
 * @param {File} file
 * @returns {string | null}
 */
export function validateProductPreviewVideoFile(file) {
  if (!isAllowedUploadVideoFile(file)) {
    return VIDEO_URL_FIELD_UI.ERROR_TYPE;
  }
  if (file.size > STORY_UPLOAD_VIDEO_MAX_BYTES) {
    return buildUploadVideoSizeError(file.size, STORY_UPLOAD_VIDEO_MAX_BYTES);
  }
  return null;
}
