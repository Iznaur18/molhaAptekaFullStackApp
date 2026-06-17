import { resolveUploadedImageUrlForBrowser } from "@izibuy/shared-lib";

import { API_BASE_URL, UPLOAD_BASE_URL } from "@/shared/config";

const UPLOAD_ASSET_PATH_RE = /(\/uploads\/[^?#]+)/i;

const resolveMediaBaseUrl = (): string => {
  const base = (UPLOAD_BASE_URL || API_BASE_URL || "").trim();
  return base.replace(/\/$/, "");
};

/**
 * Абсолютный URL для `<Image>` / `<Video>` без `window`.
 * Dev SPA origins (127.0.0.1:5173 и т.п.) → EXPO_PUBLIC_API_URL / UPLOAD_BASE_URL.
 */
export const resolveUploadedMediaUrl = (raw: string): string => {
  const url = String(raw ?? "").trim();
  if (!url) {
    return "";
  }

  const base = resolveMediaBaseUrl();
  if (base) {
    return resolveUploadedImageUrlForBrowser(url, base);
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const uploadMatch = url.match(UPLOAD_ASSET_PATH_RE);
  const path = uploadMatch?.[1] ?? (url.startsWith("/") ? url : "");
  if (!path) {
    return url;
  }

  return path;
};

export const isDisplayableMediaUrl = (raw: unknown): boolean => {
  const url = String(raw ?? "").trim();
  if (!url) {
    return false;
  }
  if (/^data:image\//i.test(url)) {
    return true;
  }
  if (/^https?:\/\//i.test(url)) {
    return true;
  }
  return url.startsWith("/uploads/") || UPLOAD_ASSET_PATH_RE.test(url);
};
