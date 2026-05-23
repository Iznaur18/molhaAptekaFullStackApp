/** Query `sort` для GET /product и GET /product/my */
export const PRODUCT_SORT_NEWEST = 'newest';
export const PRODUCT_SORT_VIEWS = 'views';
export const PRODUCT_SORT_PURCHASES = 'purchases';
/** Каталог: только товары премиум-продавцов (сортировка как «новинки»). */
export const PRODUCT_SORT_PREMIUM = 'premium';
/** Каталог: только товары продавцов с подтверждёнными данными. */
export const PRODUCT_SORT_CONFIRMED = 'confirmed';

export const PRODUCT_SORT_VALUES = [
    PRODUCT_SORT_NEWEST,
    PRODUCT_SORT_VIEWS,
    PRODUCT_SORT_PURCHASES,
    PRODUCT_SORT_PREMIUM,
    PRODUCT_SORT_CONFIRMED,
];
