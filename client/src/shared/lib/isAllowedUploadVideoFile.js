import {
  UPLOAD_VIDEO_EXTENSIONS,
  UPLOAD_VIDEO_MIME_TYPES,
} from "../config/uploadConstants.js";

const mimeSet = new Set(UPLOAD_VIDEO_MIME_TYPES);
const extensionSet = new Set(UPLOAD_VIDEO_EXTENSIONS);

const IOS_FALLBACK_MIME_TYPES = new Set(["application/octet-stream"]);

/**
 * @param {string} rawMime
 */
export function normalizeUploadVideoMime(rawMime) {
  return String(rawMime ?? "")
    .trim()
    .toLowerCase()
    .split(";")[0]
    .trim();
}

/**
 * @param {string} fileName
 */
export function getUploadVideoFileExtension(fileName) {
  const normalized = String(fileName ?? "").trim().toLowerCase();
  const dotIndex = normalized.lastIndexOf(".");
  if (dotIndex < 0) {
    return "";
  }
  return normalized.slice(dotIndex);
}

/**
 * @param {Pick<File, "name" | "type">} file
 */
export function isAllowedUploadVideoFile(file) {
  const mime = normalizeUploadVideoMime(file?.type);
  const extension = getUploadVideoFileExtension(file?.name);

  if (mime && mimeSet.has(mime)) {
    return true;
  }

  if (extension !== "" && extensionSet.has(extension)) {
    return true;
  }

  if (mime && IOS_FALLBACK_MIME_TYPES.has(mime) && extension !== "") {
    return extensionSet.has(extension);
  }

  return false;
}
