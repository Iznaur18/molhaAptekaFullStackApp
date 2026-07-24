import { CART_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { CART_LOW_STOCK_WARNING_THRESHOLD } from "./cartConstants.js";

/**
 * @param {number} purchaseLimit
 * @param {number} quantity
 * @returns {string | null}
 */
export function getCartLineStockHint(purchaseLimit, quantity) {
  if (purchaseLimit <= 0) {
    return null;
  }

  if (quantity >= purchaseLimit) {
    return CART_PAGE_UI.STOCK_QUANTITY_LIMITED;
  }

  if (purchaseLimit <= CART_LOW_STOCK_WARNING_THRESHOLD) {
    return CART_PAGE_UI.STOCK_REMAINING(purchaseLimit);
  }

  return null;
}
