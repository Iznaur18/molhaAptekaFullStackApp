import { INTRO_UPLOAD_VIDEO_MAX_BYTES } from "../config/uploadConstants.js";
import { INTRO_VIDEO_UPLOAD_UI } from "../config/appUiCopy.js";
import { buildUploadVideoSizeError } from "./formatUploadBytesAsMb.js";
import { isAllowedUploadVideoFile } from "./isAllowedUploadVideoFile.js";

/**
 * @param {File} file
 * @returns {string | null}
 */
export function validateIntroUploadVideoFile(file) {
  if (!isAllowedUploadVideoFile(file)) {
    return INTRO_VIDEO_UPLOAD_UI.ERROR_TYPE;
  }
  if (file.size > INTRO_UPLOAD_VIDEO_MAX_BYTES) {
    return buildUploadVideoSizeError(file.size, INTRO_UPLOAD_VIDEO_MAX_BYTES);
  }
  return null;
}
