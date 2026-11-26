export type GameDiscountAppliedPromoRow = {
  productId: string;
  code?: string;
  discountPercent?: number;
};

export type GameDiscountWinInput = {
  sellerId?: string | null;
  discountPercent?: number | null;
  /** Товар-приз — не скидка, в merge не участвует. */
  prizeProductId?: string | null;
};

export type GameDiscountProductInput = {
  productId: string;
  sellerId: string;
  /** Для выбора «самого дорогого» у продавца. */
  productPrice: number;
};

const toPercent = (value: unknown): number => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? n : 0;
};

const toPrice = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/**
 * На продавца — один productId: максимальная цена, при равенстве — меньший id.
 */
export const pickMostExpensiveProductIdBySeller = (
  products: GameDiscountProductInput[],
): Map<string, string> => {
  const bestBySeller = new Map<string, { productId: string; productPrice: number }>();
  for (const product of products) {
    const sellerId = String(product?.sellerId ?? "");
    const productId = String(product?.productId ?? "");
    if (!sellerId || !productId) {
      continue;
    }
    const productPrice = toPrice(product.productPrice);
    const current = bestBySeller.get(sellerId);
    if (
      !current ||
      productPrice > current.productPrice ||
      (productPrice === current.productPrice && productId < current.productId)
    ) {
      bestBySeller.set(sellerId, { productId, productPrice });
    }
  }
  const result = new Map<string, string>();
  for (const [sellerId, row] of bestBySeller) {
    result.set(sellerId, row.productId);
  }
  return result;
};

/**
 * Скидка из игр продавца → только на 1 самый дорогой товар этого продавца.
 * Зеркало createOrder (v1: самый дорогой, вся строка qty, лучший %).
 */
export const mergeSellerGameDiscountWinsIntoAppliedPromos = (
  appliedPromos: GameDiscountAppliedPromoRow[],
  wins: GameDiscountWinInput[],
  products: GameDiscountProductInput[],
  promoCode: string,
): GameDiscountAppliedPromoRow[] => {
  const base = Array.isArray(appliedPromos) ? [...appliedPromos] : [];
  if (!Array.isArray(wins) || wins.length === 0 || !Array.isArray(products)) {
    return base;
  }

  const bestWinBySellerId = new Map<string, GameDiscountWinInput>();
  for (const win of wins) {
    if (win?.prizeProductId) {
      continue;
    }
    const sellerId = String(win?.sellerId ?? "");
    if (!sellerId) {
      continue;
    }
    const current = bestWinBySellerId.get(sellerId);
    if (
      !current ||
      toPercent(win.discountPercent) > toPercent(current.discountPercent)
    ) {
      bestWinBySellerId.set(sellerId, win);
    }
  }
  if (bestWinBySellerId.size === 0) {
    return base;
  }

  const targetProductIdBySeller = pickMostExpensiveProductIdBySeller(products);
  const merged = [...base];

  for (const [sellerId, win] of bestWinBySellerId) {
    const productId = targetProductIdBySeller.get(sellerId);
    if (!productId) {
      continue;
    }
    const discountPercent = toPercent(win.discountPercent);
    if (discountPercent < 1) {
      continue;
    }
    const existingIndex = merged.findIndex(
      (row) => String(row?.productId) === productId,
    );
    const existing = existingIndex >= 0 ? merged[existingIndex] : null;
    if (existing && toPercent(existing.discountPercent) >= discountPercent) {
      continue;
    }
    const row: GameDiscountAppliedPromoRow = {
      productId,
      code: promoCode,
      discountPercent,
    };
    if (existingIndex >= 0) {
      merged[existingIndex] = row;
    } else {
      merged.push(row);
    }
  }

  return merged;
};
