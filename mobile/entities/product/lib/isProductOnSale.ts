import { resolveProductDiscountPercent } from "@/entities/product/lib/computeProductDiscountPercent";
import { PRODUCT_SALE_FILTER_MIN_DISCOUNT_PERCENT } from "@/entities/product/lib/productSaleConstants";

export const isProductOnSale = (product: Record<string, unknown>): boolean => {
  const discountPercent = resolveProductDiscountPercent(product);
  if (discountPercent == null) {
    return false;
  }

  return discountPercent >= PRODUCT_SALE_FILTER_MIN_DISCOUNT_PERCENT;
};
