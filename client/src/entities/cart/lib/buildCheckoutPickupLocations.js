/**
 * @typedef {{ address: string; productTitles: string[] }} CheckoutPickupLocation
 */

/**
 * Unique pickup points for checkout, grouped by address with product titles.
 *
 * @param {Array<{ product?: { productPickupAddress?: string | null; productName?: string | null } | null }>} lines
 * @returns {CheckoutPickupLocation[]}
 */
export function buildCheckoutPickupLocations(lines) {
  /** @type {Map<string, CheckoutPickupLocation>} */
  const byAddress = new Map();

  for (const line of lines ?? []) {
    const address = String(line?.product?.productPickupAddress ?? "").trim();
    if (!address) {
      continue;
    }

    const title = String(line?.product?.productName ?? "").trim();
    const existing = byAddress.get(address);
    if (!existing) {
      byAddress.set(address, {
        address,
        productTitles: title ? [title] : [],
      });
      continue;
    }

    if (title && !existing.productTitles.includes(title)) {
      existing.productTitles.push(title);
    }
  }

  return [...byAddress.values()];
}
