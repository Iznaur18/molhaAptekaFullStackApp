import { deleteUploadFileByUrl } from "../upload/deleteUploadFileByUrl.js";

const UPLOAD_ASSET_PATH_RE = /\/uploads\/[^?#]+/i;

/**
 * @param {string | null | undefined} url
 */
export const isManagedSellerPersonalCategoryUploadUrl = (url) => {
  const value = String(url ?? "").trim();
  if (!value) {
    return false;
  }
  return UPLOAD_ASSET_PATH_RE.test(value);
};

/**
 * @param {string | null | undefined} previousUrl
 * @param {string | null | undefined} nextUrl
 */
export const cleanupReplacedSellerPersonalCategoryImage = async (previousUrl, nextUrl) => {
  const prev = String(previousUrl ?? "").trim();
  const next = String(nextUrl ?? "").trim();
  if (!prev || prev === next || !isManagedSellerPersonalCategoryUploadUrl(prev)) {
    return;
  }
  try {
    await deleteUploadFileByUrl(prev);
  } catch (error) {
    console.error("cleanupReplacedSellerPersonalCategoryImage error:", error);
  }
};
