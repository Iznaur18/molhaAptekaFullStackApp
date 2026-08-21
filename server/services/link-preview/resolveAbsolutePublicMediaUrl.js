import { USER_BACKGROUND_PRESET_PREFIX } from "../../constants/userBackgroundPresets.js";
import { resolveFrontendOrigin } from "../../utils/resolveFrontendOrigin.js";

const trimTrailingSlash = (url) => String(url).replace(/\/$/, "");

/**
 * Абсолютный HTTPS/HTTP URL для og:image.
 * `preset:*` и пустые → "".
 *
 * @param {string | null | undefined} raw
 * @param {{ pageOrigin?: string }} [options]
 * @returns {string}
 */
export function resolveAbsolutePublicMediaUrl(raw, options = {}) {
  const value = String(raw ?? "").trim();
  if (!value) {
    return "";
  }
  if (value.startsWith(USER_BACKGROUND_PRESET_PREFIX)) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (value.startsWith("//")) {
    return `https:${value}`;
  }
  if (!value.startsWith("/")) {
    return "";
  }

  const configured = process.env.PUBLIC_UPLOAD_BASE_URL?.trim();
  const pageOrigin =
    options.pageOrigin?.trim() ||
    resolveFrontendOrigin(process.env.FRONTEND_URL);
  const base = configured ? trimTrailingSlash(configured) : trimTrailingSlash(pageOrigin);
  return `${base}${value}`;
}

/**
 * @param {string} absoluteUrl
 * @param {string | number | Date | null | undefined} version
 */
export function appendMediaCacheBust(absoluteUrl, version) {
  const url = String(absoluteUrl ?? "").trim();
  if (!url) {
    return "";
  }
  let bust = "";
  if (version instanceof Date) {
    bust = String(version.getTime());
  } else if (typeof version === "number" && Number.isFinite(version)) {
    bust = String(Math.trunc(version));
  } else if (version != null && String(version).trim() !== "") {
    const parsed = Date.parse(String(version));
    bust = Number.isFinite(parsed) ? String(parsed) : String(version).trim();
  }
  if (!bust) {
    return url;
  }
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(bust)}`;
}

/**
 * @returns {string}
 */
export function resolveSiteOgImageUrl() {
  const origin = resolveFrontendOrigin(process.env.FRONTEND_URL);
  return `${trimTrailingSlash(origin)}/og-image.png`;
}
