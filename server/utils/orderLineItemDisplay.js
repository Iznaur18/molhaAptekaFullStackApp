import { ORDER_LINE_ITEM_DELETED_PRODUCT_NAME } from "../constants/orderConstants.js";

/**
 * @param {unknown} item
 * @returns {string}
 */
export function resolveOrderLineItemProductName(item) {
  const populated = item?.productId;
  if (populated != null && typeof populated === "object") {
    const name = populated.productName;
    if (typeof name === "string" && name.trim() !== "") {
      return name.trim();
    }
  }

  const snapshot = item?.productNameAtOrder;
  if (typeof snapshot === "string" && snapshot.trim() !== "") {
    return snapshot.trim();
  }

  return ORDER_LINE_ITEM_DELETED_PRODUCT_NAME;
}
