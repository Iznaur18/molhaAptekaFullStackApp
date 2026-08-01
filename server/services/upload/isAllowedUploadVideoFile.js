import path from "node:path";

import {
  UPLOAD_VIDEO_EXTENSIONS,
  UPLOAD_VIDEO_MIME_TYPES,
} from "../../constants/uploadConstants.js";

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
 * @param {Pick<Express.Multer.File, "mimetype" | "originalname">} file
 */
export function isAllowedUploadVideoFile(file) {
  const mime = normalizeUploadVideoMime(file?.mimetype);
  const extension = path.extname(String(file?.originalname ?? "")).toLowerCase();

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
