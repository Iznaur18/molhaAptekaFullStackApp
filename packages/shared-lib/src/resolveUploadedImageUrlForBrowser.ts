const UPLOAD_ASSET_PATH_RE = /(\/uploads\/[^?#]+)/i;

function isDevSpaUploadOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin);
    if (parsed.port === "5173" || parsed.port === "4173") {
      return true;
    }
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
      return true;
    }
    if (/^192\.168\./.test(host) || /^10\./.test(host)) {
      return true;
    }
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Логика отображения upload URL в браузере (без window).
 */
export const resolveUploadedImageUrlForBrowser = (
  raw: unknown,
  pageOrigin: string,
): string => {
  const url = String(raw ?? "").trim();
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      const pathMatch = parsed.pathname.match(UPLOAD_ASSET_PATH_RE);
      if (pathMatch) {
        if (parsed.origin === pageOrigin || isDevSpaUploadOrigin(parsed.origin)) {
          return `${pageOrigin}${pathMatch[1]}`;
        }
      }
      return url;
    } catch {
      return url;
    }
  }

  const uploadPathMatch = url.match(UPLOAD_ASSET_PATH_RE);
  if (uploadPathMatch) {
    return `${pageOrigin}${uploadPathMatch[1]}`;
  }

  if (url.startsWith("/")) {
    return `${pageOrigin}${url}`;
  }

  return url;
};
