const UPLOAD_ASSET_PATH_RE = /(\/uploads\/[^?#]+)/i;

export const normalizeUploadUrlForStorage = (raw: unknown): string => {
  const url = String(raw ?? "").trim();
  if (!url) {
    return "";
  }

  const uploadPathMatch = url.match(UPLOAD_ASSET_PATH_RE);
  if (uploadPathMatch) {
    return uploadPathMatch[1];
  }

  if (url.startsWith("/uploads/")) {
    return url;
  }

  return url;
};
