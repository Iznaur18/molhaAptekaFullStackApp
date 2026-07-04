export {
  INTRO_UPLOAD_VIDEO_MAX_BYTES,
  INTRO_UPLOAD_VIDEO_MAX_MB,
  STORY_UPLOAD_VIDEO_MAX_BYTES,
  STORY_UPLOAD_VIDEO_MAX_MB,
  UPLOAD_VIDEO_MAX_BYTES,
  UPLOAD_VIDEO_MAX_MB,
} from "@molha/api-contract";

export const UPLOAD_VIDEO_ALLOWED_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);
