import { IMAGE_URL_FIELD_UI } from "../config/appUiCopy.js";
import {
  UPLOAD_ALLOWED_MIME_TYPES,
  UPLOAD_MAX_BYTES,
} from "../config/uploadConstants.js";

/**
 * @param {File} file
 * @returns {string | null} сообщение об ошибке или null
 */
export function validateUploadImageFile(file) {
  if (!UPLOAD_ALLOWED_MIME_TYPES.includes(file.type)) {
    return IMAGE_URL_FIELD_UI.ERROR_TYPE;
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return IMAGE_URL_FIELD_UI.ERROR_SIZE;
  }
  return null;
}
