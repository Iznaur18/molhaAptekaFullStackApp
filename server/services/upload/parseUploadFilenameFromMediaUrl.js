const UPLOAD_PATH_RE = /\/uploads\/([^?#/]+)/i;
/** Только имена, которые пишет `buildUploadFilename` — без `..`, `\`, `/`. */
const SAFE_UPLOAD_FILENAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,200}$/;

/**
 * @param {string | null | undefined} filename
 * @returns {boolean}
 */
export function isSafeUploadFilename(filename) {
  return typeof filename === "string" && SAFE_UPLOAD_FILENAME_RE.test(filename);
}

/**
 * @param {string | null | undefined} mediaUrl
 * @returns {string | null}
 */
export function parseUploadFilenameFromMediaUrl(mediaUrl) {
  const match = String(mediaUrl ?? "").match(UPLOAD_PATH_RE);
  const filename = match?.[1] ?? null;
  if (!filename || !isSafeUploadFilename(filename)) {
    return null;
  }
  return filename;
}
