import { validateUploadVideoFile } from "../../../shared/lib/validateUploadVideoFile.js";
import { isAllowedUploadVideoFile } from "../../../shared/lib/isAllowedUploadVideoFile.js";
import { PRODUCT_PREVIEW_VIDEO_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_PREVIEW_VIDEO_MAX_DURATION_SEC } from "../model/productConstants.js";

const DURATION_TOLERANCE_SEC = 0.25;
const METADATA_READ_TIMEOUT_MS = 10_000;

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
    if (isAllowedUploadVideoFile(file)) {
      return null;
    }
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
    let settled = false;

    const settle = (handler, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
      handler(value);
    };

    const timeoutId = setTimeout(() => {
      settle(reject, new Error("video metadata timeout"));
    }, METADATA_READ_TIMEOUT_MS);

    video.playsInline = true;
    video.muted = true;
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      settle(resolve, {
        duration: Number(video.duration) || 0,
      });
    };
    video.onerror = () => {
      settle(reject, new Error("video metadata"));
    };
    video.src = objectUrl;
  });
}
