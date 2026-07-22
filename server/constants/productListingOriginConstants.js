/** Статус происхождения товара при листинге (блок 1 на деталях). */
export const PRODUCT_LISTING_ORIGIN_OWN = "own";
export const PRODUCT_LISTING_ORIGIN_RESALE = "resale";
export const PRODUCT_LISTING_ORIGIN_MANUFACTURER = "manufacturer";

export const PRODUCT_LISTING_ORIGIN_VALUES = [
  PRODUCT_LISTING_ORIGIN_OWN,
  PRODUCT_LISTING_ORIGIN_RESALE,
  PRODUCT_LISTING_ORIGIN_MANUFACTURER,
];

export const PRODUCT_LISTING_ORIGIN_REQUIRED_MESSAGE = "Выберите статус товара";
export const PRODUCT_LISTING_ORIGIN_INVALID_MESSAGE = "Некорректный статус товара";
