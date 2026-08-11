import { resolveProductUnitPrice } from "./productWholesale.js";

const toNonNegInt = (value: unknown): number => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const toPercent = (value: unknown): number => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? n : 0;
};

export type ProductPromoLike = {
  productPrice?: number | null;
  productWholesaleEnabled?: boolean | null;
  productWholesaleMinQty?: number | null;
  productWholesalePrice?: number | null;
  quantity?: number | null;
  promoDiscountPercent?: number | null;
};

export const applyPromoPercentToRetailPrice = (
  retailPrice: number,
  discountPercent: number,
): number => {
  const retail = toNonNegInt(retailPrice);
  const percent = toPercent(discountPercent);
  if (retail <= 0 || percent < 1 || percent > 99) {
    return retail;
  }
  return Math.max(1, Math.floor((retail * (100 - percent)) / 100));
};

/**
 * Опт и промо независимо от розницы; итог — меньшая цена за единицу.
 */
export const resolveProductUnitPriceWithPromo = (
  input: ProductPromoLike,
): number => {
  const retail = toNonNegInt(input.productPrice);
  const baseOrWholesale = resolveProductUnitPrice(input);
  const percent = toPercent(input.promoDiscountPercent);
  if (percent < 1 || percent > 99) {
    return baseOrWholesale;
  }
  const promoUnit = applyPromoPercentToRetailPrice(retail, percent);
  return Math.min(baseOrWholesale, promoUnit);
};

export const resolveProductPromoLineSavings = (input: {
  productPrice?: number | null;
  quantity?: number | null;
  unitPrice: number;
  promoDiscountPercent?: number | null;
}): number => {
  const percent = toPercent(input.promoDiscountPercent);
  if (percent < 1 || percent > 99) {
    return 0;
  }
  const retail = toNonNegInt(input.productPrice);
  const qty = toNonNegInt(input.quantity);
  const unit = toNonNegInt(input.unitPrice);
  if (retail <= 0 || qty <= 0 || unit <= 0 || unit >= retail) {
    return 0;
  }
  return (retail - unit) * qty;
};
