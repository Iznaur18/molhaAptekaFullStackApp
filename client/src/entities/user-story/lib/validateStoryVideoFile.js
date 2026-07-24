import { STORY_UPLOAD_VIDEO_MAX_BYTES } from "../../../shared/config/uploadConstants.js";
import { buildUploadVideoSizeError } from "../../../shared/lib/formatUploadBytesAsMb.js";
import { isAllowedUploadVideoFile } from "../../../shared/lib/isAllowedUploadVideoFile.js";
import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Паритет mobile `pickVideoAsset`: type + size, без aspect-check.
 *
 * @param {File} file
 * @returns {string | null}
 */
export function validateStoryVideoFile(file) {
  if (!isAllowedUploadVideoFile(file)) {
    return USER_STORY_UI.ERROR_VIDEO_TYPE;
  }

  if (file.size > STORY_UPLOAD_VIDEO_MAX_BYTES) {
    return buildUploadVideoSizeError(file.size, STORY_UPLOAD_VIDEO_MAX_BYTES);
  }

  return null;
}
