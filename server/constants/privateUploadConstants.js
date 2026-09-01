/** Подкаталог на диске / префикс S3-ключа для чувствительных медиа. */
export const PRIVATE_UPLOAD_SUBDIR = "private";

/** `POST /upload?purpose=passport-selfie` */
export const PASSPORT_SELFIE_UPLOAD_PURPOSE = "passport-selfie";

/**
 * `POST /upload?purpose=courier-document` — фото авто и документов курьера.
 *
 * Права и ПТС видит только стафф, поэтому private, а не публичные uploads.
 * Фото авто туда же: они привязаны к госномеру и правам конкретного человека.
 */
export const COURIER_DOCUMENT_UPLOAD_PURPOSE = "courier-document";

/**
 * Документы читают глазами: номер прав и VIN должны остаться разборчивыми,
 * поэтому сторона больше и качество выше, чем у витринных картинок.
 */
export const COURIER_DOCUMENT_MAX_DIM = 2200;
export const COURIER_DOCUMENT_WEBP_QUALITY = 86;

/** Публичный API-путь (не express.static). */
export const PRIVATE_UPLOAD_API_PATH_PREFIX = "/upload/private/";
