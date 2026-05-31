import { validateUploadVideoFile } from "../../../shared/lib/validateUploadVideoFile.js";
import { PRODUCT_PREVIEW_VIDEO_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_PREVIEW_VIDEO_MAX_DURATION_SEC } from "../model/productConstants.js";

const DURATION_TOLERANCE_SEC = 0.25;

/**
 * @param {File} file
 * @returns {Promise<string | null>}
 */
export async function validateProductPreviewVideoFile(file) {
  const baseError = validateUploadVideoFile(file);
  if (baseError) return baseError;

  try {
    const metadata = await readVideoMetadata(file);
    if (
      metadata.duration >
      PRODUCT_PREVIEW_VIDEO_MAX_DURATION_SEC + DURATION_TOLERANCE_SEC
    ) {
      return PRODUCT_PREVIEW_VIDEO_UI.ERROR_DURATION;
    }
    return null;
  } catch {
    return PRODUCT_PREVIEW_VIDEO_UI.ERROR_READ;
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
        duration: Number(video.duration) || 0,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("video metadata"));
    };
    video.src = objectUrl;
  });
}
