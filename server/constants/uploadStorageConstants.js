/** Локальная папка `uploads/` (dev и legacy prod). */
export const UPLOAD_STORAGE_DISK = "disk";

/** S3-совместимое object storage (AWS S3, Cloudflare R2, MinIO). */
export const UPLOAD_STORAGE_S3 = "s3";

export const UPLOAD_STORAGE_VALUES = [UPLOAD_STORAGE_DISK, UPLOAD_STORAGE_S3];

/** Префикс ключей в бакете — совпадает с URL `/uploads/...`. */
export const UPLOAD_OBJECT_KEY_PREFIX = "uploads/";
