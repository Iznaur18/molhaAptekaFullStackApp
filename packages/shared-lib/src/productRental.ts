export const PRODUCT_RENTAL_PRICE_UNIT_HOUR = "hour";
export const PRODUCT_RENTAL_PRICE_UNIT_DAY = "day";

export const PRODUCT_RENTAL_PRICE_UNIT_VALUES = [
  PRODUCT_RENTAL_PRICE_UNIT_HOUR,
  PRODUCT_RENTAL_PRICE_UNIT_DAY,
] as const;

export type ProductRentalPriceUnit =
  (typeof PRODUCT_RENTAL_PRICE_UNIT_VALUES)[number];

export type ProductRentalLike = {
  productRentalEnabled?: boolean | null;
  productRentalPriceRub?: number | null;
  productRentalPriceUnit?: string | null;
};

const toPositiveInt = (value: unknown): number => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const isProductRentalPriceUnit = (
  value: unknown,
): value is ProductRentalPriceUnit =>
  value === PRODUCT_RENTAL_PRICE_UNIT_HOUR ||
  value === PRODUCT_RENTAL_PRICE_UNIT_DAY;

export const isProductRentalConfigured = (
  product: ProductRentalLike | null | undefined,
): boolean => {
  if (!product) {
    return false;
  }
  const price = toPositiveInt(product.productRentalPriceRub);
  return price > 0 && isProductRentalPriceUnit(product.productRentalPriceUnit);
};
