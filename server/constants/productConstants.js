/** Максимум URL изображений на один товар (схема, валидация, бизнес-логика). */
export const PRODUCT_IMAGE_URLS_MAX = 5;

/** Лимит товаров продавца (не премиум). */
export const SELLER_PRODUCTS_LIMIT_REGULAR = 15;

/** Лимит товаров продавца (премиум). */
export const SELLER_PRODUCTS_LIMIT_PREMIUM = 30;

/** Ответ при попытке создать товар сверх лимита. */
export const SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE =
    'Достигнут лимит товаров: 15 для обычных пользователей, 30 для премиум.';

/** Максимум слов в описании товара (валидация POST/PATCH /product). */
export const PRODUCT_DESCRIPTION_MAX_WORDS = 100;

/**
 * Slug категории товара. Совпадает с клиентом `client/.../productConstants.js`.
 * `food`, `figures` — устаревшие значения enum до расширения списка (могут остаться в БД).
 */
export const PRODUCT_CATEGORY_VALUES = [
  "grocery",
  "electronics",
  "clothing",
  "footwear",
  "home_garden",
  "kids",
  "beauty_health",
  "appliances",
  "sport_leisure",
  "construction",
  "pharmacy",
  "pets",
  "books",
  "tourism_outdoors",
  "auto_parts",
  "furniture",
  "hobby_crafts",
  "accessories",
  "jewelry",
  "music_video",
  "stationery",
  "antiques",
  "digital",
  "household_care",
  "games",
  "automobiles",
  "travel_services",
  "food",
  "figures",
];
