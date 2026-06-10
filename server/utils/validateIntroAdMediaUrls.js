import { normalizeStoredUploadUrl } from "./buildPublicUploadUrl.js";

const UPLOAD_ASSET_PATH_RE = /\/uploads\/[^?#]+/i;

/**
 * @param {string | null | undefined} url
 */
const isUploadedAssetUrl = (url) => {
  if (!url) {
    return true;
  }
  const normalized = normalizeStoredUploadUrl(String(url));
  return UPLOAD_ASSET_PATH_RE.test(normalized);
};

/**
 * @param {{
 *   videoMp4Url: string;
 *   videoWebmUrl?: string | null;
 *   posterUrl?: string | null;
 * }} media
 */
export const assertIntroAdMediaUrlsAreUploadedAssets = (media) => {
  const urls = [media.videoMp4Url, media.videoWebmUrl, media.posterUrl];

  for (const url of urls) {
    if (!isUploadedAssetUrl(url)) {
      throw new Error("INTRO_AD_MEDIA_URL_INVALID");
    }
  }
};
