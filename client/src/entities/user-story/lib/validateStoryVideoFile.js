import { UPLOAD_VIDEO_MAX_BYTES } from "../../../shared/config/uploadConstants.js";
import { buildUploadVideoSizeError } from "../../../shared/lib/formatUploadBytesAsMb.js";
import { isAllowedUploadVideoFile } from "../../../shared/lib/isAllowedUploadVideoFile.js";
import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";
import { USER_STORY_ASPECT_RATIO } from "../model/constants.js";

const ASPECT_TOLERANCE = 0.06;

/**
 * @param {File} file
 * @returns {Promise<string | null>}
 */
export async function validateStoryVideoFile(file) {
  if (!isAllowedUploadVideoFile(file)) {
    return USER_STORY_UI.ERROR_VIDEO_TYPE;
  }

  if (file.size > UPLOAD_VIDEO_MAX_BYTES) {
    return buildUploadVideoSizeError(file.size, UPLOAD_VIDEO_MAX_BYTES);
  }

  try {
    const metadata = await readVideoMetadata(file);
    const ratio = metadata.width / metadata.height;
    if (Math.abs(ratio - USER_STORY_ASPECT_RATIO) > ASPECT_TOLERANCE) {
      return USER_STORY_UI.ERROR_VIDEO_ASPECT;
    }

    return null;
  } catch {
    return USER_STORY_UI.ERROR_VIDEO_READ;
  }
}

/**
 * @param {File} file
 */
function readVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("video metadata"));
    };
    video.src = objectUrl;
  });
}
