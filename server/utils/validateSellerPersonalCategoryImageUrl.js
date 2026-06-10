import { normalizeStoredUploadUrl } from "./buildPublicUploadUrl.js";

const UPLOAD_ASSET_PATH_RE = /\/uploads\/[^?#]+/i;

/**
 * @param {string | null | undefined} url
 */
export const assertSellerPersonalCategoryImageUrlIsUploadedAsset = (url) => {
  if (!url || !String(url).trim()) {
    throw new Error("SELLER_PERSONAL_CATEGORY_IMAGE_REQUIRED");
  }
  const normalized = normalizeStoredUploadUrl(String(url).trim());
  if (!UPLOAD_ASSET_PATH_RE.test(normalized)) {
    throw new Error("SELLER_PERSONAL_CATEGORY_IMAGE_URL_INVALID");
  }
};
