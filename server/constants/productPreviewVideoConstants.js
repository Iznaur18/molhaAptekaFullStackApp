/** Максимальная длительность превью-видео на карточке товара (сек). */
export const PRODUCT_PREVIEW_VIDEO_MAX_DURATION_SEC = 3;

/**
 * Пиковый видеобитрейт (страховка на «тяжёлых» кадрах) — реальный размер
 * задаёт CRF ниже. Снижен с 2 до 1.5 Мбит: на превью-масштабе незаметно.
 */
export const PRODUCT_PREVIEW_VIDEO_MAX_BITRATE_MBIT = 1.5;

/**
 * Целевое качество (CRF x264). 27 — визуально без потерь на превью-масштабе,
 * заметно меньше файл, чем дефолтный 23. См. замеры в PR.
 */
export const PRODUCT_PREVIEW_VIDEO_CRF = 27;

/**
 * Превью рендерится в маленьком media-слайде (object-fit: cover); больше
 * ~1080px по длинной стороне на экране не появляется. 1920 был избыточен.
 */
export const PRODUCT_PREVIEW_VIDEO_MAX_WIDTH_PX = 1080;

export const PRODUCT_PREVIEW_VIDEO_REQUIRES_PHOTO_MESSAGE =
  "При превью-видео нужно хотя бы одно фото товара";
