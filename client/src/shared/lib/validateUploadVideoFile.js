import { VIDEO_URL_FIELD_UI } from "../config/appUiCopy.js";
import { UPLOAD_VIDEO_MAX_BYTES } from "../config/uploadConstants.js";
import { buildUploadVideoSizeError } from "./formatUploadBytesAsMb.js";
import { isAllowedUploadVideoFile } from "./isAllowedUploadVideoFile.js";

/**
 * @param {File} file
 * @returns {string | null}
 */
export function validateUploadVideoFile(file) {
  if (!isAllowedUploadVideoFile(file)) {
    return VIDEO_URL_FIELD_UI.ERROR_TYPE;
  }
  if (file.size > UPLOAD_VIDEO_MAX_BYTES) {
    return buildUploadVideoSizeError(file.size, UPLOAD_VIDEO_MAX_BYTES);
  }
  return null;
}
