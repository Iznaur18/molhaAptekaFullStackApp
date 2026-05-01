/** Совпадает с `enum` в `server/models/ProductModel.js`. */
export const PRODUCT_CATEGORY_ELECTRONICS = 'electronics';
export const PRODUCT_CATEGORY_CLOTHING = 'clothing';
export const PRODUCT_CATEGORY_FOOD = 'food';

export const PRODUCT_CATEGORIES = [
  PRODUCT_CATEGORY_ELECTRONICS,
  PRODUCT_CATEGORY_CLOTHING,
  PRODUCT_CATEGORY_FOOD,
];

/** Подписи для UI (сервер отдаёт только ключ enum). */
export const PRODUCT_CATEGORY_LABEL_RU = {
  [PRODUCT_CATEGORY_ELECTRONICS]: 'Электроника',
  [PRODUCT_CATEGORY_CLOTHING]: 'Одежда',
  [PRODUCT_CATEGORY_FOOD]: 'Продукты',
};
