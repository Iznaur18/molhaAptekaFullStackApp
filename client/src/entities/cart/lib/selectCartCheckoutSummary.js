import { CART_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { getCartLineExclusionReason } from "./getCartLineExclusionReason.js";
import { selectPurchasableCartLines } from "./selectPurchasableCartLines.js";
import {
  sumCartLinesCatalogDiscount,
  sumCartLinesCatalogListTotal,
  sumCartLinesPromoDiscount,
  sumCartLinesWholesaleDiscount,
} from "./sumCartLinesCatalogDiscount.js";

/** @type {ReadonlySet<string>} */
const EMPTY_DESELECTION = new Set();

/**
 * @typedef {{
 *   selectedLines: import("./selectCartLines.js").CartLine[];
 *   checkoutBlockReason: string | null;
 *   selectedTotal: number;
 *   selectedListTotal: number;
 *   selectedDiscount: number;
 *   selectedPromoDiscount: number;
 *   selectedWholesaleDiscount: number;
 *   fullTotal: number;
 *   hasPartialSelection: boolean;
 * }} CartCheckoutSummary
 */

/**
 * @param {import("./selectCartLines.js").CartLine[]} lines
 * @returns {number}
 */
const sumLineTotals = (lines) =>
  lines.reduce((sum, line) => sum + line.lineTotal, 0);

/**
 * @param {import("./selectCartLines.js").CartLine[]} lines
 * @param {import("./selectCartLines.js").CartLine[]} purchasableLines
 * @param {import("./selectCartLines.js").CartLine[]} selectedLines
 * @param {string | null | undefined} currentUserId
 * @returns {string | null}
 */
const resolveCheckoutBlockReason = (
  lines,
  purchasableLines,
  selectedLines,
  currentUserId,
) => {
  if (lines.length === 0 || selectedLines.length > 0) {
    return null;
  }

  if (purchasableLines.length > 0) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_NOTHING_SELECTED;
  }

  const reasons = lines.map((line) =>
    getCartLineExclusionReason(line, currentUserId),
  );

  if (reasons.every((reason) => reason === "own_product")) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_OWN_PRODUCTS_ONLY;
  }

  if (reasons.every((reason) => reason === "missing_pickup")) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_MISSING_PICKUP;
  }

  if (
    reasons.every(
      (reason) =>
        reason === "missing" ||
        reason === "unavailable" ||
        reason === "missing_pickup",
    )
  ) {
    return CART_PAGE_UI.CHECKOUT_BLOCKED_ALL_UNAVAILABLE;
  }

  return CART_PAGE_UI.CHECKOUT_BLOCKED_NO_PURCHASABLE;
};

/**
 * @param {import("./selectCartLines.js").CartLine[]} lines
 * @param {string | null | undefined} [currentUserId]
 * @param {ReadonlySet<string>} [deselectedIds]
 * @returns {CartCheckoutSummary}
 */
export function selectCartCheckoutSummary(
  lines,
  currentUserId,
  deselectedIds = EMPTY_DESELECTION,
) {
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
    selectedPromoDiscount: sumCartLinesPromoDiscount(selectedLines),
    selectedWholesaleDiscount: sumCartLinesWholesaleDiscount(selectedLines),
    fullTotal: sumLineTotals(lines),
    hasPartialSelection: selectedLines.length < lines.length,
  };
}
