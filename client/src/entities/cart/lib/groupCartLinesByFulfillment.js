import {
  CART_FULFILLMENT_SECTION_DELIVERY,
  resolveCartLineFulfillmentSection,
} from "@molha/api-contract";

/**
 * @param {import("./selectCartLines.js").CartLine[]} visibleLines
 * @returns {{
 *   pickupLines: import("./selectCartLines.js").CartLine[];
 *   deliveryLines: import("./selectCartLines.js").CartLine[];
 * }}
 */
export function groupCartLinesByFulfillment(visibleLines) {
  /** @type {import("./selectCartLines.js").CartLine[]} */
  const pickupLines = [];
  /** @type {import("./selectCartLines.js").CartLine[]} */
  const deliveryLines = [];

  for (const line of visibleLines) {
    if (
      resolveCartLineFulfillmentSection(line.product) ===
      CART_FULFILLMENT_SECTION_DELIVERY
    ) {
      deliveryLines.push(line);
    } else {
      pickupLines.push(line);
    }
  }

  return { pickupLines, deliveryLines };
}
