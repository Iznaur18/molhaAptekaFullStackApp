import {
  CART_FULFILLMENT_SECTION_DELIVERY,
  resolveCartLineFulfillmentSection,
} from "@molha/api-contract";

import type { CartLine } from "./selectCartLines";

export function groupCartLinesByFulfillment(visibleLines: CartLine[]): {
  pickupLines: CartLine[];
  deliveryLines: CartLine[];
} {
  const pickupLines: CartLine[] = [];
  const deliveryLines: CartLine[] = [];

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
