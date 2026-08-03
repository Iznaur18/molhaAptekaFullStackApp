/** Query `sort` для GET /product и GET /product/my */
export const PRODUCT_SORT_NEWEST = "newest";
export const PRODUCT_SORT_VIEWS = "views";
export const PRODUCT_SORT_PURCHASES = "purchases";
/** Каталог: только товары премиум-продавцов (сортировка как «новинки»). */
export const PRODUCT_SORT_PREMIUM = "premium";
/** Каталог: только товары продавцов с подтверждёнными данными. */
export const PRODUCT_SORT_CONFIRMED = "confirmed";
/** Каталог: товары с отзывами, сортировка по рейтингу. */
export const PRODUCT_SORT_REVIEWS = "reviews";

/** Минимум отзывов для ленты `sort=reviews`. */
export const PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT = 1;

export const PRODUCT_SORT_VALUES = [
  PRODUCT_SORT_NEWEST,
  PRODUCT_SORT_VIEWS,
  PRODUCT_SORT_PURCHASES,
  PRODUCT_SORT_PREMIUM,
  PRODUCT_SORT_CONFIRMED,
  PRODUCT_SORT_REVIEWS,
];
