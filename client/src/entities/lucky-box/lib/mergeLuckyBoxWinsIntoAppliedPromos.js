import { LUCKY_BOX_ORDER_PROMO_CODE } from "@molha/api-contract";

/**
 * Проецирует активные выигрыши «Коробок удачи» на товары корзины в том же
 * виде, что и применённые промокоды ({productId, code, discountPercent}).
 * На каждого продавца — лучший выигрыш; обычный промо перебивается только
 * если процент выигрыша выше. Зеркалит логику createOrder на сервере.
 *
 * @param {Array<{ productId: string; code?: string; discountPercent?: number }>} appliedPromos
 * @param {Array<{ sellerId: string; discountPercent: number }>} wins
 * @param {Array<{ _id: unknown; productSeller?: { _id?: unknown } | null }>} products
 */
export function mergeLuckyBoxWinsIntoAppliedPromos(appliedPromos, wins, products) {
  const base = Array.isArray(appliedPromos) ? [...appliedPromos] : [];
  if (!Array.isArray(wins) || wins.length === 0 || !Array.isArray(products)) {
    return base;
  }

  /** Лучший выигрыш на продавца (только скидочные: товар-приз промо не даёт). */
  const bestWinBySellerId = new Map();
  for (const win of wins) {
    if (win?.prizeProductId) {
      continue;
    }
    const sellerId = String(win?.sellerId ?? "");
    if (!sellerId) {
      continue;
    }
    const current = bestWinBySellerId.get(sellerId);
    if (!current || win.discountPercent > current.discountPercent) {
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
    const row = {
      productId,
      code: LUCKY_BOX_ORDER_PROMO_CODE,
      discountPercent: win.discountPercent,
    };
    if (existingIndex >= 0) {
      merged[existingIndex] = row;
    } else {
      merged.push(row);
    }
  }
  return merged;
}
