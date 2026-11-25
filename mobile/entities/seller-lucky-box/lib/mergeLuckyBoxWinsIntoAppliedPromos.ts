import { LUCKY_BOX_ORDER_PROMO_CODE } from "@molha/api-contract";

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
  productSeller?: { _id?: unknown } | null;
};

/**
 * Проецирует активные выигрыши «Коробок удачи» на товары корзины.
 * Паритет web `mergeLuckyBoxWinsIntoAppliedPromos.js` / createOrder.
 */
export function mergeLuckyBoxWinsIntoAppliedPromos(
  appliedPromos: CartAppliedPromoRow[],
  wins: LuckyBoxWinForCart[],
  products: CartProductForPromoMerge[],
): CartAppliedPromoRow[] {
  const base = Array.isArray(appliedPromos) ? [...appliedPromos] : [];
  if (!Array.isArray(wins) || wins.length === 0 || !Array.isArray(products)) {
    return base;
  }

  const bestWinBySellerId = new Map<string, LuckyBoxWinForCart>();
  for (const win of wins) {
    if (win?.prizeProductId) {
      continue;
    }
    const sellerId = String(win?.sellerId ?? "");
    if (!sellerId) {
      continue;
    }
    const current = bestWinBySellerId.get(sellerId);
    if (!current || Number(win.discountPercent) > Number(current.discountPercent)) {
      bestWinBySellerId.set(sellerId, win);
    }
  }

  const merged = [...base];
  for (const product of products) {
    const productId = String(product?._id ?? "");
    const sellerId = String(product?.productSeller?._id ?? "");
    const win = sellerId ? bestWinBySellerId.get(sellerId) : null;
    if (!productId || !win) {
      continue;
    }
    const existingIndex = merged.findIndex(
      (row) => String(row?.productId) === productId,
    );
    const existing = existingIndex >= 0 ? merged[existingIndex] : null;
    if (existing && Number(existing.discountPercent) >= Number(win.discountPercent)) {
      continue;
    }
    const row: CartAppliedPromoRow = {
      productId,
      code: LUCKY_BOX_ORDER_PROMO_CODE,
      discountPercent: Number(win.discountPercent),
    };
    if (existingIndex >= 0) {
      merged[existingIndex] = row;
    } else {
      merged.push(row);
    }
  }
  return merged;
}
