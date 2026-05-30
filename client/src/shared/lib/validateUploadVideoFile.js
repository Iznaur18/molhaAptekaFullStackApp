import { VIDEO_URL_FIELD_UI } from "../config/appUiCopy.js";
import {
  UPLOAD_VIDEO_MAX_BYTES,
  UPLOAD_VIDEO_MIME_TYPES,
} from "../config/uploadConstants.js";

/**
 * @param {File} file
 * @returns {string | null}
 */
export function validateUploadVideoFile(file) {
  if (!UPLOAD_VIDEO_MIME_TYPES.includes(file.type)) {
    return VIDEO_URL_FIELD_UI.ERROR_TYPE;
  }
  if (file.size > UPLOAD_VIDEO_MAX_BYTES) {
    return VIDEO_URL_FIELD_UI.ERROR_SIZE;
  }
  return null;
}
