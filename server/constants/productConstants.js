/** Максимум URL изображений на один товар (схема, валидация, бизнес-логика). */
export const PRODUCT_IMAGE_URLS_MAX = 5;

/** Лимит товаров продавца (не премиум). */
export const SELLER_PRODUCTS_LIMIT_REGULAR = 15;

/** Лимит товаров продавца (премиум). */
export const SELLER_PRODUCTS_LIMIT_PREMIUM = 30;

/** Ответ при попытке создать товар сверх лимита. */
export const SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE =
  "Достигнут лимит товаров: 15 для обычных пользователей, 30 для премиум.";

/** Максимум символов в описании товара (валидация POST/PATCH /product). */
export const PRODUCT_DESCRIPTION_MAX_CHARS = 2000;

/** Минимум символов в описании товара. */
export const PRODUCT_DESCRIPTION_MIN_CHARS = 10;

/** Максимум цены товара / предложения цены (9 цифр, ₽). Совпадает с клиентом. */
export const PRODUCT_PRICE_RUB_MAX = 999_999_999;

export const PRODUCT_PRICE_RUB_MAX_ERROR_MESSAGE =
  "Цена не может превышать 999 999 999 ₽";

/**
 * Slug категории товара. Совпадает с клиентом `client/.../productConstants.js`.
 * `food` — устаревшее значение enum до расширения списка (может остаться в БД).
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
];
