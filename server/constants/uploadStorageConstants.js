/** Локальная папка `uploads/` (dev и legacy prod). */
export const UPLOAD_STORAGE_DISK = "disk";

/** S3-совместимое object storage (Selectel, Yandex Object Storage, MinIO). */
export const UPLOAD_STORAGE_S3 = "s3";

/**
 * Кэш публичных медиа на CDN: имя файла случайное и никогда не переиспользуется,
 * замена фото = новый файл — поэтому объект можно кэшировать навсегда.
 */
export const PUBLIC_UPLOAD_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Как часто `/health` заново проверяет доступность бакета. */
export const OBJECT_STORAGE_HEALTH_TTL_MS = 60_000;

/** Таймаут проверки бакета: зависшее хранилище не должно вешать `/health`. */
export const OBJECT_STORAGE_HEALTH_TIMEOUT_MS = 3_000;

export const UPLOAD_STORAGE_VALUES = [UPLOAD_STORAGE_DISK, UPLOAD_STORAGE_S3];

/** Префикс ключей в бакете — совпадает с URL `/uploads/...`. */
export const UPLOAD_OBJECT_KEY_PREFIX = "uploads/";
