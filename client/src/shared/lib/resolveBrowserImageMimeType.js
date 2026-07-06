const HEIC_FILE_NAME_RE = /\.heic$|\.heif$/i;

const EXTENSION_MIME_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

/**
 * Safari на iOS часто отдаёт File с пустым `type` — берём MIME из расширения.
 *
 * @param {File} file
 * @returns {string}
 */
export function resolveBrowserImageMimeType(file) {
  const declaredType = String(file?.type ?? "")
    .trim()
    .toLowerCase();
  if (declaredType) {
    return declaredType === "image/jpg" ? "image/jpeg" : declaredType;
  }

  const name = String(file?.name ?? "").trim().toLowerCase();
  const extension = name.includes(".") ? name.split(".").pop() : "";
  return EXTENSION_MIME_TYPES[extension] ?? "";
}

/**
 * @param {File} file
 * @returns {boolean}
 */
export function isBrowserHeicImageFile(file) {
  const mime = resolveBrowserImageMimeType(file);
  if (
    mime === "image/heic" ||
    mime === "image/heif" ||
    mime === "image/heic-sequence" ||
    mime === "image/heif-sequence"
  ) {
    return true;
  }

  return HEIC_FILE_NAME_RE.test(String(file?.name ?? ""));
}
