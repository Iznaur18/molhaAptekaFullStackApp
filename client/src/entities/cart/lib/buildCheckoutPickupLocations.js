import { productPickupLocationsFromProduct } from "@molha/api-contract";

/**
 * @typedef {{
 *   id: string;
 *   label: string;
 *   address: string;
 *   lat: number | null;
 *   lon: number | null;
 *   isDefault: boolean;
 * }} CheckoutProductPickupLocation
 */

/**
 * @typedef {{
 *   productId: string;
 *   productTitle: string;
 *   locations: CheckoutProductPickupLocation[];
 * }} CheckoutProductPickupGroup
 */

/**
 * Per-product pickup points for checkout selection.
 *
 * @param {Array<{
 *   product?: {
 *     _id?: string;
 *     productName?: string | null;
 *     productPickupAddress?: string | null;
 *     productPickupLat?: number | null;
 *     productPickupLon?: number | null;
 *     productPickupLocations?: unknown;
 *   } | null;
 * }>} lines
 * @returns {CheckoutProductPickupGroup[]}
 */
export function buildCheckoutPickupLocations(lines) {
  /** @type {Map<string, CheckoutProductPickupGroup>} */
  const byProductId = new Map();

  for (const line of lines ?? []) {
    const product = line?.product;
    const productId = String(product?._id ?? "").trim();
    if (!productId) {
      continue;
    }

    const locations = productPickupLocationsFromProduct(product).filter(
      (item) => String(item.address ?? "").trim().length > 0,
    );
    if (locations.length === 0) {
      continue;
    }

    if (byProductId.has(productId)) {
      continue;
    }

    byProductId.set(productId, {
      productId,
      productTitle: String(product?.productName ?? "").trim(),
      locations,
    });
  }

  return [...byProductId.values()];
}

/**
 * Flat unique addresses (legacy display / multi-product summary without selection UI).
 *
 * @param {CheckoutProductPickupGroup[]} groups
 * @param {Record<string, string>} [selectedByProductId]
 */
export function flattenCheckoutPickupAddresses(groups, selectedByProductId = {}) {
  /** @type {Map<string, { address: string; productTitles: string[] }>} */
  const byAddress = new Map();

  for (const group of groups ?? []) {
    const selectedId = selectedByProductId[group.productId];
    const location =
      group.locations.find((item) => item.id === selectedId) ??
      group.locations.find((item) => item.isDefault) ??
      group.locations[0];
    if (!location) {
      continue;
    }
    const address = String(location.address ?? "").trim();
    if (!address) {
      continue;
    }
    const existing = byAddress.get(address);
    if (!existing) {
      byAddress.set(address, {
        address,
        productTitles: group.productTitle ? [group.productTitle] : [],
      });
      continue;
    }
    if (group.productTitle && !existing.productTitles.includes(group.productTitle)) {
      existing.productTitles.push(group.productTitle);
    }
  }

  return [...byAddress.values()];
}

/**
 * @param {CheckoutProductPickupGroup[]} groups
 * @returns {Record<string, string>}
 */
export function resolveInitialPickupSelections(groups) {
  /** @type {Record<string, string>} */
  const selected = {};
  for (const group of groups ?? []) {
    const defaultItem =
      group.locations.find((item) => item.isDefault) ?? group.locations[0];
    if (defaultItem) {
      selected[group.productId] = defaultItem.id;
    }
  }
  return selected;
}

/**
 * @param {Record<string, string>} selectedByProductId
 * @returns {Array<{ productId: string; pickupLocationId: string }>}
 */
export function buildPickupSelectionsPayload(selectedByProductId) {
  return Object.entries(selectedByProductId ?? {})
    .filter(([productId, locationId]) => productId && locationId)
    .map(([productId, pickupLocationId]) => ({ productId, pickupLocationId }));
}
