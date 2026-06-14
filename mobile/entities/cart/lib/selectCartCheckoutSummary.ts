import { CART_PAGE_UI } from "@/shared/config";

import { getCartLineExclusionReason } from "./getCartLineExclusionReason";
import type { CartLine } from "./selectCartLines";
import { selectPurchasableCartLines } from "./selectPurchasableCartLines";

export type CartCheckoutSummary = {
  purchasableLines: CartLine[];
  excludedCount: number;
  checkoutBlockReason: string | null;
  displayTotal: number;
  fullTotal: number;
  purchasableTotal: number;
  hasExcludedLines: boolean;
};

const sumLineTotals = (lines: CartLine[]) =>
  lines.reduce((sum, line) => sum + line.lineTotal, 0);

const resolveCheckoutBlockReason = (
  lines: CartLine[],
  purchasableLines: CartLine[],
  currentUserId?: string | null,
): string | null => {
  if (lines.length === 0 || purchasableLines.length > 0) {
    return null;
  }

  const reasons = lines.map((line) => getCartLineExclusionReason(line, currentUserId));

  if (reasons.every((reason) => reason === "own_product")) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_OWN_PRODUCTS_ONLY;
  }

  if (reasons.every((reason) => reason === "missing" || reason === "unavailable")) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_ALL_UNAVAILABLE;
  }

  return CART_PAGE_UI.CHECKOUT_BLOCKED_NO_PURCHASABLE;
};

export const selectCartCheckoutSummary = (
  lines: CartLine[],
  currentUserId?: string | null,
): CartCheckoutSummary => {
  const purchasableLines = selectPurchasableCartLines(lines, currentUserId);
  const excludedCount = lines.length - purchasableLines.length;
  const fullTotal = sumLineTotals(lines);
  const purchasableTotal = sumLineTotals(purchasableLines);

  return {
    purchasableLines,
    excludedCount,
    checkoutBlockReason: resolveCheckoutBlockReason(lines, purchasableLines, currentUserId),
    displayTotal: excludedCount > 0 ? purchasableTotal : fullTotal,
    fullTotal,
    purchasableTotal,
    hasExcludedLines: excludedCount > 0,
  };
};
