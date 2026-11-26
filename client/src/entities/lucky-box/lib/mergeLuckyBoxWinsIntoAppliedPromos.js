import { LUCKY_BOX_ORDER_PROMO_CODE } from "@molha/api-contract";
import { mergeSellerGameDiscountWinsIntoAppliedPromos } from "@izibuy/shared-lib";

/**
 * @param {Array<{ productId: string; code?: string; discountPercent?: number }>} appliedPromos
 * @param {Array<{ sellerId: string; discountPercent: number; prizeProductId?: string|null }>} wins
 * @param {Array<{ _id: unknown; productPrice?: number|null; productSeller?: { _id?: unknown } | null }>} products
 */
export function mergeLuckyBoxWinsIntoAppliedPromos(appliedPromos, wins, products) {
  const mappedProducts = (Array.isArray(products) ? products : []).map((product) => ({
    productId: String(product?._id ?? ""),
    sellerId: String(product?.productSeller?._id ?? ""),
    productPrice: Number(product?.productPrice) || 0,
  }));
  return mergeSellerGameDiscountWinsIntoAppliedPromos(
    appliedPromos,
    wins,
    mappedProducts,
    LUCKY_BOX_ORDER_PROMO_CODE,
  );
}
