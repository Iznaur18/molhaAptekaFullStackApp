import { deleteUploadFileByUrl } from "../upload/deleteUploadFileByUrl.js";

const UPLOAD_ASSET_PATH_RE = /\/uploads\/[^?#]+/i;

/**
 * @param {string | null | undefined} url
 */
export const isManagedAppIntroUploadUrl = (url) => {
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
export const cleanupReplacedAppIntroMedia = async (previousUrl, nextUrl) => {
  const prev = String(previousUrl ?? "").trim();
  const next = String(nextUrl ?? "").trim();
  if (!prev || prev === next || !isManagedAppIntroUploadUrl(prev)) {
    return;
  }
  try {
    await deleteUploadFileByUrl(prev);
  } catch (error) {
    console.error("cleanupReplacedAppIntroMedia error:", error);
  }
};
