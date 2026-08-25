/** Оригинальность товара — тумблер продавца: true/false выбраны, undefined — нет. */
export const isProductIsOriginalSelected = (value: unknown): boolean =>
  value === true || value === false;

export const isProductOriginalBadgeVisible = (value: unknown): boolean => value === true;
