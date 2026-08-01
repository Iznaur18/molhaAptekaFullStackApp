import path from "node:path";

import { normalizeUploadVideoMime } from "./isAllowedUploadVideoFile.js";

const EXTENSION_TO_CONTENT_TYPE = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  quicktime: "video/quicktime",
};

/**
 * @param {string} filename
 * @param {string} [fallbackMime]
 */
export function resolveUploadContentType(filename, fallbackMime = "") {
  const extension = path
    .extname(String(filename ?? ""))
    .toLowerCase()
    .slice(1);
  if (extension && EXTENSION_TO_CONTENT_TYPE[extension]) {
    return EXTENSION_TO_CONTENT_TYPE[extension];
  }

  const normalizedMime = normalizeUploadVideoMime(fallbackMime);
  if (normalizedMime && normalizedMime !== "application/octet-stream") {
    return normalizedMime;
  }

  return "application/octet-stream";
}
