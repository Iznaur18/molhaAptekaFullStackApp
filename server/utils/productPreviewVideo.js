import { normalizeStoredUploadUrl } from "./buildPublicUploadUrl.js";
import { PRODUCT_PREVIEW_VIDEO_REQUIRES_PHOTO_MESSAGE } from "../constants/productPreviewVideoConstants.js";

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeProductPreviewVideoUrl(raw) {
  return normalizeStoredUploadUrl(String(raw ?? "").trim());
}

/**
 * @param {string} videoUrl
 * @param {string[]} imageUrls
 */
export function assertProductPreviewVideoRequiresPhotos(videoUrl, imageUrls) {
  if (!videoUrl) return;
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new Error(PRODUCT_PREVIEW_VIDEO_REQUIRES_PHOTO_MESSAGE);
  }
}
