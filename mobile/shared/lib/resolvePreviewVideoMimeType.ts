/** Синхрон с `client/src/shared/lib/resolvePreviewVideoMimeType.js`. */
export const resolvePreviewVideoMimeType = (src: string): string => {
  const normalized = String(src ?? "").toLowerCase();

  if (normalized.includes(".mov") || normalized.includes(".quicktime")) {
    return "video/quicktime";
  }
  if (normalized.includes(".m4v")) {
    return "video/mp4";
  }
  if (normalized.includes(".webm")) {
    return "video/webm";
  }

  return "video/mp4";
};
