import { CART_PAGE_UI } from "@/shared/config";

import { getCartLineExclusionReason } from "./getCartLineExclusionReason";
import type { CartLine } from "./selectCartLines";
import { selectPurchasableCartLines } from "./selectPurchasableCartLines";
import {
  sumCartLinesCatalogDiscount,
  sumCartLinesCatalogListTotal,
  sumCartLinesWholesaleDiscount,
} from "./sumCartLinesCatalogDiscount";

export type CartCheckoutSummary = {
  /** Строки, которые уйдут в заказ: доступные к покупке и отмеченные галочкой. */
  selectedLines: CartLine[];
  checkoutBlockReason: string | null;
  selectedTotal: number;
  selectedListTotal: number;
  selectedDiscount: number;
  selectedWholesaleDiscount: number;
  fullTotal: number;
  /** Итог к оформлению меньше итога по корзине: часть строк исключена или не выбрана. */
  hasPartialSelection: boolean;
};

const EMPTY_DESELECTION: ReadonlySet<string> = new Set();

const sumLineTotals = (lines: CartLine[]) =>
  lines.reduce((sum, line) => sum + line.lineTotal, 0);

const resolveCheckoutBlockReason = (
  lines: CartLine[],
  purchasableLines: CartLine[],
  selectedLines: CartLine[],
  currentUserId?: string | null,
): string | null => {
  if (lines.length === 0 || selectedLines.length > 0) {
    return null;
  }

  if (purchasableLines.length > 0) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_NOTHING_SELECTED;
  }

  const reasons = lines.map((line) => getCartLineExclusionReason(line, currentUserId));

  if (reasons.every((reason) => reason === "own_product")) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_OWN_PRODUCTS_ONLY;
  }

  if (reasons.every((reason) => reason === "missing_pickup")) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_MISSING_PICKUP;
  }

  if (
    reasons.every(
      (reason) =>
        reason === "missing" || reason === "unavailable" || reason === "missing_pickup",
    )
  ) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_ALL_UNAVAILABLE;
  }

  return CART_PAGE_UI.CHECKOUT_BLOCKED_NO_PURCHASABLE;
};

export const selectCartCheckoutSummary = (
  lines: CartLine[],
  currentUserId?: string | null,
  deselectedIds: ReadonlySet<string> = EMPTY_DESELECTION,
): CartCheckoutSummary => {
  const purchasableLines = selectPurchasableCartLines(lines, currentUserId);
  const selectedLines = purchasableLines.filter(
    (line) => !deselectedIds.has(line.productId),
  );

  return {
    selectedLines,
    checkoutBlockReason: resolveCheckoutBlockReason(
      lines,
      purchasableLines,
      selectedLines,
      currentUserId,
    ),
    selectedTotal: sumLineTotals(selectedLines),
    selectedListTotal: sumCartLinesCatalogListTotal(selectedLines),
    selectedDiscount: sumCartLinesCatalogDiscount(selectedLines),
    selectedWholesaleDiscount: sumCartLinesWholesaleDiscount(selectedLines),
    fullTotal: sumLineTotals(lines),
    hasPartialSelection: selectedLines.length < lines.length,
  };
};
