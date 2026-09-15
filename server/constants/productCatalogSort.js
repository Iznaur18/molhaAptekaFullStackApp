/** Query `sort` для GET /product и GET /product/my */
export const PRODUCT_SORT_NEWEST = "newest";
export const PRODUCT_SORT_VIEWS = "views";
export const PRODUCT_SORT_PURCHASES = "purchases";
/**
 * Каталог: только товары премиум-продавцов (сортировка как «новинки»).
 * Устаревшая форма `sellerPremium=true`, принимается для старых ссылок.
 */
export const PRODUCT_SORT_PREMIUM = "premium";
/**
 * Каталог: только товары продавцов с подтверждёнными данными.
 * Устаревшая форма `sellerConfirmed=true`, принимается для старых ссылок.
 */
export const PRODUCT_SORT_CONFIRMED = "confirmed";
/** Каталог: товары с отзывами, сортировка по рейтингу. */
export const PRODUCT_SORT_REVIEWS = "reviews";
/** Сначала дешевле / дороже — по `productPrice`. */
export const PRODUCT_SORT_PRICE_ASC = "price_asc";
export const PRODUCT_SORT_PRICE_DESC = "price_desc";
/** По рейтингу без фильтра «только с отзывами»: товары без отзывов в конце. */
export const PRODUCT_SORT_RATING = "rating";
/** По размеру скидки: товары без скидки в конце. */
export const PRODUCT_SORT_DISCOUNT = "discount";

/**
 * Сортировки, которые покупатель выбирает явно. Порядок в них честный: без
 * буста продвижения и без приоритета региона — «Дешевле» значит дешевле.
 */
export const PRODUCT_SORTS_WITHOUT_BOOST = [
  PRODUCT_SORT_PRICE_ASC,
  PRODUCT_SORT_PRICE_DESC,
  PRODUCT_SORT_RATING,
  PRODUCT_SORT_DISCOUNT,
];

/** Минимум отзывов для ленты `sort=reviews`. */
export const PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT = 1;

export const PRODUCT_SORT_VALUES = [
  PRODUCT_SORT_NEWEST,
  PRODUCT_SORT_VIEWS,
  PRODUCT_SORT_PURCHASES,
  PRODUCT_SORT_PREMIUM,
  PRODUCT_SORT_CONFIRMED,
  PRODUCT_SORT_REVIEWS,
  ...PRODUCT_SORTS_WITHOUT_BOOST,
];
