import path from "node:path";

import { normalizeUploadVideoMime } from "./isAllowedUploadVideoFile.js";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
]);

const IMAGE_MIME_TO_EXTENSION = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const VIDEO_MIME_TO_EXTENSION = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/hevc": "mov",
  "video/h265": "mov",
  "video/x-hevc": "mov",
  "video/x-m4v": "m4v",
};

/**
 * @param {Pick<Express.Multer.File, "mimetype" | "originalname">} file
 */
export function resolveUploadFileExtension(file) {
  const fromName = path.extname(String(file?.originalname ?? "")).toLowerCase();
  if (fromName && ALLOWED_EXTENSIONS.has(fromName)) {
    return fromName.slice(1);
  }

  const mime = normalizeUploadVideoMime(file?.mimetype);
  if (VIDEO_MIME_TO_EXTENSION[mime]) {
    return VIDEO_MIME_TO_EXTENSION[mime];
  }
  if (IMAGE_MIME_TO_EXTENSION[mime]) {
    return IMAGE_MIME_TO_EXTENSION[mime];
  }

  const rawPart = mime.split("/")[1]?.replace(/[^a-z0-9]/gi, "");
  return rawPart || "bin";
}
