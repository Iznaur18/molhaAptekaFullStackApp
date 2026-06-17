import { UPLOAD_IMAGE_MAX_BYTES, UPLOAD_IMAGE_MIME_TYPES } from "@molha/api-contract";

export { UPLOAD_IMAGE_MAX_BYTES };

export const UPLOAD_IMAGE_ALLOWED_MIME_TYPES = new Set(
  UPLOAD_IMAGE_MIME_TYPES.filter((mimeType) => mimeType !== "image/jpg"),
);
