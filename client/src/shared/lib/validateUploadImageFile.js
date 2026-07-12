import { IMAGE_URL_FIELD_UI } from "../config/appUiCopy.js";
import {
  UPLOAD_ALLOWED_MIME_TYPES,
  UPLOAD_IMAGE_SOURCE_MAX_BYTES,
} from "../config/uploadConstants.js";

import { resolveBrowserImageMimeType } from "./resolveBrowserImageMimeType.js";

/**
 * Проверяет исходный файл, выбранный пользователем. Лимит — 50 МБ:
 * перед отправкой файл автоматически сжимается (см. uploadImage).
 *
 * @param {File} file
 * @returns {string | null} сообщение об ошибке или null
 */
export function validateUploadImageFile(file) {
  const mimeType = resolveBrowserImageMimeType(file);
  if (!UPLOAD_ALLOWED_MIME_TYPES.includes(mimeType)) {
    return IMAGE_URL_FIELD_UI.ERROR_TYPE;
  }
  if (file.size > UPLOAD_IMAGE_SOURCE_MAX_BYTES) {
    return IMAGE_URL_FIELD_UI.ERROR_SIZE;
  }
  return null;
}
