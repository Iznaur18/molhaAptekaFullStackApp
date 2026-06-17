import {
  UPLOAD_IMAGE_MAX_BYTES,
  UPLOAD_IMAGE_MIME_TYPES,
  UPLOAD_VIDEO_EXTENSIONS,
  UPLOAD_VIDEO_MAX_BYTES,
  UPLOAD_VIDEO_MAX_MB,
  UPLOAD_VIDEO_MIME_TYPES,
} from "@molha/api-contract";

export const UPLOAD_MAX_BYTES = UPLOAD_IMAGE_MAX_BYTES;

export const UPLOAD_ALLOWED_MIME_TYPES = UPLOAD_IMAGE_MIME_TYPES.filter(
  (mimeType) => mimeType !== "image/jpg",
);

export const UPLOAD_FILE_INPUT_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

/** iOS при выборе из «Фото» часто перекодирует HEVC — файл в браузере крупнее, чем в галерее. */
export { UPLOAD_VIDEO_MAX_MB, UPLOAD_VIDEO_MAX_BYTES, UPLOAD_VIDEO_MIME_TYPES, UPLOAD_VIDEO_EXTENSIONS };

export const UPLOAD_VIDEO_FILE_INPUT_ACCEPT =
  "video/mp4,video/webm,video/quicktime,video/hevc,video/*,.mp4,.webm,.mov,.m4v";
