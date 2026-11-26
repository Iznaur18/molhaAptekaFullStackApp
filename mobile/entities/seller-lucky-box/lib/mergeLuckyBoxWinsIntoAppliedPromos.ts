import { LUCKY_BOX_ORDER_PROMO_CODE } from "@molha/api-contract";
import { mergeSellerGameDiscountWinsIntoAppliedPromos } from "@izibuy/shared-lib";

export type CartAppliedPromoRow = {
  productId: string;
  code?: string;
  discountPercent?: number;
};

export type LuckyBoxWinForCart = {
  sellerId?: string | null;
  discountPercent?: number | null;
  prizeProductId?: string | null;
};

type CartProductForPromoMerge = {
  _id?: unknown;
  productPrice?: number | null;
  productSeller?: { _id?: unknown } | null;
};

/** Паритет web / createOrder: скидка игры только на 1 самый дорогой товар продавца. */
export function mergeLuckyBoxWinsIntoAppliedPromos(
  appliedPromos: CartAppliedPromoRow[],
  wins: LuckyBoxWinForCart[],
  products: CartProductForPromoMerge[],
): CartAppliedPromoRow[] {
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
