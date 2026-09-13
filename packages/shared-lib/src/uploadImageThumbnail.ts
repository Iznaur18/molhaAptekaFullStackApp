/**
 * Уменьшенные копии фото для сетки/ленты товаров.
 *
 * Оригинал хранится до 1600 px по длинной стороне, а ячейке сетки хватает
 * ~600 px: iPhone 3× × ~198 pt, десктоп 2× × ~300 pt. iOS декодирует картинку
 * целиком — оригинал занимает до ~10 МБ памяти, превью ~1,4 МБ. Из-за этого
 * лента на iPhone подвисала при долгой прокрутке (13.09.2026).
 *
 * Правило имени одно для сервера (создание, удаление, бэкфил) и клиентов:
 * `<имя>.(webp|jpg|jpeg|png)` → `<имя>-w600.webp` рядом с оригиналом в `/uploads/`.
 */
export const UPLOAD_IMAGE_THUMBNAIL_MAX_DIM = 600;

const THUMBNAIL_SUFFIX = `-w${UPLOAD_IMAGE_THUMBNAIL_MAX_DIM}`;
const THUMBNAIL_EXTENSION = ".webp";
const THUMBNAILABLE_EXTENSION_RE = /\.(webp|jpe?g|png)$/i;
/** Как `SAFE_UPLOAD_FILENAME_RE` сервера: без `..`, `/`, `\`. */
const SAFE_UPLOAD_FILENAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,200}$/;
/**
 * Файл сразу после `/uploads/` — поэтому `/uploads/private/...` не совпадает
 * (в имени не бывает `/`), и приватные файлы превью не получают.
 */
const UPLOAD_FILE_URL_RE = /^(.*\/uploads\/)([^/?#]+)([?#].*)?$/i;

export function isUploadImageThumbnailFilename(filename: string): boolean {
  return String(filename ?? "")
    .toLowerCase()
    .endsWith(`${THUMBNAIL_SUFFIX}${THUMBNAIL_EXTENSION}`);
}

/**
 * Имя превью для загруженного фото или `null`, если превью не бывает
 * (не картинка, небезопасное имя, это уже превью).
 */
export function buildUploadImageThumbnailFilename(filename: string): string | null {
  const name = String(filename ?? "").trim();
  if (!SAFE_UPLOAD_FILENAME_RE.test(name) || !THUMBNAILABLE_EXTENSION_RE.test(name)) {
    return null;
  }
  if (isUploadImageThumbnailFilename(name)) {
    return null;
  }

  const thumbnail = `${name.replace(THUMBNAILABLE_EXTENSION_RE, "")}${THUMBNAIL_SUFFIX}${THUMBNAIL_EXTENSION}`;
  return SAFE_UPLOAD_FILENAME_RE.test(thumbnail) ? thumbnail : null;
}

/**
 * URL фото → URL его превью. Всё, что не файл из `/uploads/` (внешние ссылки,
 * `data:`, приватные файлы, уже превью), возвращается без изменений.
 * Origin/CDN и query сохраняются.
 */
export function toUploadImageThumbnailUrl(url: string): string {
  const match = String(url ?? "").match(UPLOAD_FILE_URL_RE);
  const prefix = match?.[1];
  const filename = match?.[2];
  if (!prefix || !filename) {
    return url;
  }

  const thumbnail = buildUploadImageThumbnailFilename(filename);
  if (!thumbnail) {
    return url;
  }

  return `${prefix}${thumbnail}${match?.[3] ?? ""}`;
}
