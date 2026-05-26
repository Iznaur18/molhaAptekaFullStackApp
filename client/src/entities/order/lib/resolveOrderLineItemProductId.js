/**
 * @param {import('../model/types.js').OrderLineItem} item
 * @returns {string | null}
 */
export function resolveOrderLineItemProductId(item) {
  const populated = item.productId;
  if (populated == null) {
    return null;
  }
  if (typeof populated === "object" && populated._id != null) {
    return String(populated._id);
  }
  if (typeof populated === "string") {
    return populated;
  }
  return null;
}
