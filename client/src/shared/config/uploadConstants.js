export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const UPLOAD_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const UPLOAD_FILE_INPUT_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

/** iOS при выборе из «Фото» часто перекодирует HEVC — файл в браузере крупнее, чем в галерее. */
export const UPLOAD_VIDEO_MAX_MB = 25;
export const UPLOAD_VIDEO_MAX_BYTES = UPLOAD_VIDEO_MAX_MB * 1024 * 1024;

export const UPLOAD_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/hevc",
  "video/h265",
  "video/x-hevc",
  "video/x-m4v",
];

export const UPLOAD_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"];

export const UPLOAD_VIDEO_FILE_INPUT_ACCEPT =
  "video/mp4,video/webm,video/quicktime,video/hevc,video/*,.mp4,.webm,.mov,.m4v";
