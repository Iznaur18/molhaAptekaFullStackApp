export const UPLOAD_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Исходник изображения на клиенте: принимаем до 50 МБ, перед отправкой
 * клиент сжимает файл — на сервер большой оригинал не уходит.
 */
export const UPLOAD_IMAGE_SOURCE_MAX_MB = 50;
export const UPLOAD_IMAGE_SOURCE_MAX_BYTES = UPLOAD_IMAGE_SOURCE_MAX_MB * 1024 * 1024;

/** Целевой размер изображения после клиентского сжатия. */
export const UPLOAD_IMAGE_COMPRESS_TARGET_BYTES = 2 * 1024 * 1024;

/** Максимальная сторона изображения после клиентского сжатия, px. */
export const UPLOAD_IMAGE_COMPRESS_MAX_DIMENSION = 2560;

export const UPLOAD_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const UPLOAD_VIDEO_MAX_MB = 5;
export const UPLOAD_VIDEO_MAX_BYTES = UPLOAD_VIDEO_MAX_MB * 1024 * 1024;

/**
 * Исходник intro-ролика: щедрый лимит, потому что сервер сразу обрезает
 * до 10 секунд и пережимает — оригинал нигде не хранится.
 */
export const INTRO_UPLOAD_VIDEO_MAX_MB = 100;
export const INTRO_UPLOAD_VIDEO_MAX_BYTES = INTRO_UPLOAD_VIDEO_MAX_MB * 1024 * 1024;

/**
 * Исходник сторис-видео: щедрый лимит, сервер пережимает в H.264 MP4.
 * Оригинал на диске не хранится.
 */
export const STORY_UPLOAD_VIDEO_MAX_MB = 100;
export const STORY_UPLOAD_VIDEO_MAX_BYTES = STORY_UPLOAD_VIDEO_MAX_MB * 1024 * 1024;

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
