/** Максимальный размер .xlsx при bulk-import. */
export const PRODUCT_BULK_IMPORT_MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Макс. строк за один импорт (обычный продавец). */
export const PRODUCT_BULK_IMPORT_MAX_ROWS_REGULAR = 50;

/** Макс. строк за один импорт (premium). */
export const PRODUCT_BULK_IMPORT_MAX_ROWS_PREMIUM = 100;

/** Макс. URL фото на строку. */
export const PRODUCT_BULK_IMPORT_MAX_IMAGE_URLS_PER_ROW = 5;

/** Таймаут проверки/скачивания одного URL фото. */
export const PRODUCT_BULK_IMPORT_IMAGE_URL_TIMEOUT_MS = 15_000;

/** POST /product/bulk-import — на пользователя или IP. */
export const PRODUCT_BULK_IMPORT_RATE_LIMIT_PER_HOUR = 10;

export const PRODUCT_BULK_IMPORT_JOB_STATUS_PENDING = "pending";
export const PRODUCT_BULK_IMPORT_JOB_STATUS_PROCESSING = "processing";
export const PRODUCT_BULK_IMPORT_JOB_STATUS_COMPLETED = "completed";
export const PRODUCT_BULK_IMPORT_JOB_STATUS_FAILED = "failed";

export const PRODUCT_BULK_IMPORT_JOB_STATUSES = [
  PRODUCT_BULK_IMPORT_JOB_STATUS_PENDING,
  PRODUCT_BULK_IMPORT_JOB_STATUS_PROCESSING,
  PRODUCT_BULK_IMPORT_JOB_STATUS_COMPLETED,
  PRODUCT_BULK_IMPORT_JOB_STATUS_FAILED,
];

export const PRODUCT_BULK_IMPORT_TEMPLATE_FILENAME =
  "molha-product-import-template.xlsx";

export const PRODUCT_BULK_IMPORT_SHEET_NAME = "Товары";
export const PRODUCT_BULK_IMPORT_CATEGORIES_SHEET_NAME = "Категории";

export const PRODUCT_BULK_IMPORT_COLUMNS = [
  "название",
  "описание",
  "цена",
  "остаток",
  "тип_происхождения",
  "фото_url",
  "категория",
  "артикул",
  "самовывоз",
  "доставка",
  "старая_цена",
];
