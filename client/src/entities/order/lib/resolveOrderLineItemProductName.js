import { ORDER_CARD_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import('../model/types.js').OrderLineItem} item
 * @returns {string}
 */
export function resolveOrderLineItemProductName(item) {
  const populated = item.productId;
  if (populated != null && typeof populated === "object") {
    const name = populated.productName?.trim();
    if (name) return name;
  }

  const snapshot = item.productNameAtOrder?.trim();
  if (snapshot) return snapshot;

  return ORDER_CARD_UI.DELETED_PRODUCT_NAME;
}

/**
 * @param {import('../model/types.js').OrderLineItem} item
 * @returns {boolean}
 */
export function isOrderLineItemProductClickable(item) {
  return item.productId != null && typeof item.productId === "object";
}
