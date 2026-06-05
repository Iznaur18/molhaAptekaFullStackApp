const UPLOAD_PATH_RE = /\/uploads\/([^?#/]+)/i;

/**
 * @param {string | null | undefined} mediaUrl
 * @returns {string | null}
 */
export function parseUploadFilenameFromMediaUrl(mediaUrl) {
  const match = String(mediaUrl ?? "").match(UPLOAD_PATH_RE);
  return match?.[1] ?? null;
}
