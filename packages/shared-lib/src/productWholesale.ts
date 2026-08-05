import { formatPriceRub } from "./formatPriceRub.js";
import { PRODUCT_WHOLESALE_MIN_QTY_MIN } from "@molha/api-contract";

export { PRODUCT_WHOLESALE_MIN_QTY_MIN };

export type ProductWholesaleLike = {
  productPrice?: number | null;
  productWholesaleEnabled?: boolean | null;
  productWholesaleMinQty?: number | null;
  productWholesalePrice?: number | null;
};

export type ResolveProductUnitPriceInput = ProductWholesaleLike & {
  quantity?: number | null;
};

const toNonNegInt = (value: unknown): number => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const isProductWholesaleConfigured = (
  product: ProductWholesaleLike | null | undefined,
): boolean => {
  if (product == null) {
    return false;
  }
  const retail = toNonNegInt(product.productPrice);
  const minQty = toNonNegInt(product.productWholesaleMinQty);
  const wholesale = toNonNegInt(product.productWholesalePrice);
  return (
    minQty >= PRODUCT_WHOLESALE_MIN_QTY_MIN &&
    wholesale > 0 &&
    retail > 0 &&
    wholesale < retail
  );
};

export const resolveProductUnitPrice = (
  input: ResolveProductUnitPriceInput,
): number => {
  const retail = toNonNegInt(input.productPrice);
  const quantity = toNonNegInt(input.quantity);
  if (
    input.productWholesaleEnabled === true &&
    isProductWholesaleConfigured(input) &&
    quantity >= toNonNegInt(input.productWholesaleMinQty)
  ) {
    return toNonNegInt(input.productWholesalePrice);
  }
  return retail;
};

export const formatProductWholesaleBadgeLabel = (
  product: ProductWholesaleLike | null | undefined,
): string | null => {
  if (product?.productWholesaleEnabled !== true || !isProductWholesaleConfigured(product)) {
    return null;
  }
  const minQty = toNonNegInt(product.productWholesaleMinQty);
  const priceLabel = formatPriceRub(toNonNegInt(product.productWholesalePrice));
  return `От ${minQty} шт — ${priceLabel}`;
};

export type ProductWholesaleOffer = {
  minQty: number;
  wholesalePrice: number;
  retailPrice: number;
  savingsPerUnit: number;
  discountPercent: number;
};

export const resolveProductWholesaleOffer = (
  product: ProductWholesaleLike | null | undefined,
): ProductWholesaleOffer | null => {
  if (product?.productWholesaleEnabled !== true || !isProductWholesaleConfigured(product)) {
    return null;
  }
  const retailPrice = toNonNegInt(product.productPrice);
  const wholesalePrice = toNonNegInt(product.productWholesalePrice);
  const minQty = toNonNegInt(product.productWholesaleMinQty);
  const savingsPerUnit = retailPrice - wholesalePrice;
  if (savingsPerUnit <= 0) {
    return null;
  }
  const discountPercent = Math.max(
    1,
    Math.min(99, Math.round((savingsPerUnit / retailPrice) * 100)),
  );
  return {
    minQty,
    wholesalePrice,
    retailPrice,
    savingsPerUnit,
    discountPercent,
  };
};
