import { API_BASE_URL, UPLOAD_BASE_URL } from "@/shared/config";

const UPLOAD_ASSET_PATH_RE = /(\/uploads\/[^?#]+)/i;

const resolveMediaBaseUrl = () => UPLOAD_BASE_URL || API_BASE_URL;

/**
 * Абсолютный URL для `<Image source={{ uri }} />` без `window`.
 */
export const resolveUploadedMediaUrl = (raw: string): string => {
  const url = String(raw ?? "").trim();
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const uploadMatch = url.match(UPLOAD_ASSET_PATH_RE);
  const path = uploadMatch?.[1] ?? (url.startsWith("/") ? url : "");
  if (!path) {
    return url;
  }

  const base = resolveMediaBaseUrl();
  if (!base) {
    return path;
  }

  return `${base}${path}`;
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
