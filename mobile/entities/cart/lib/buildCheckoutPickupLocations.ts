import { productPickupLocationsFromProduct } from "@molha/api-contract";

export type CheckoutProductPickupLocation = {
  id: string;
  label: string;
  address: string;
  lat: number | null;
  lon: number | null;
  isDefault: boolean;
};

export type CheckoutProductPickupGroup = {
  productId: string;
  productTitle: string;
  locations: CheckoutProductPickupLocation[];
};

/** Legacy flat list for summary display. */
export type CheckoutPickupLocation = {
  address: string;
  productTitles: string[];
};

type PickupLineLike = {
  product?: {
    _id?: string;
    productName?: string | null;
    productPickupAddress?: string | null;
    productPickupLat?: number | null;
    productPickupLon?: number | null;
    productPickupLocations?: unknown;
  } | null;
};

/** Per-product pickup points for checkout selection. */
export function buildCheckoutPickupGroups(
  lines: PickupLineLike[] | null | undefined,
): CheckoutProductPickupGroup[] {
  const byProductId = new Map<string, CheckoutProductPickupGroup>();

  for (const line of lines ?? []) {
    const product = line?.product;
    const productId = String(product?._id ?? "").trim();
    if (!productId || byProductId.has(productId)) {
      continue;
    }

    const locations = productPickupLocationsFromProduct(product).filter(
      (item) => String(item.address ?? "").trim().length > 0,
    );
    if (locations.length === 0) {
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

/** Flat unique addresses (summary without per-product selection). */
export function buildCheckoutPickupLocations(
  lines: PickupLineLike[] | null | undefined,
): CheckoutPickupLocation[] {
  return flattenCheckoutPickupAddresses(buildCheckoutPickupGroups(lines));
}

export function flattenCheckoutPickupAddresses(
  groups: CheckoutProductPickupGroup[],
  selectedByProductId: Record<string, string> = {},
): CheckoutPickupLocation[] {
  const byAddress = new Map<string, CheckoutPickupLocation>();

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

export function resolveInitialPickupSelections(
  groups: CheckoutProductPickupGroup[],
): Record<string, string> {
  const selected: Record<string, string> = {};
  for (const group of groups ?? []) {
    const defaultItem =
      group.locations.find((item) => item.isDefault) ?? group.locations[0];
    if (defaultItem) {
      selected[group.productId] = defaultItem.id;
    }
  }
  return selected;
}

export function buildPickupSelectionsPayload(
  selectedByProductId: Record<string, string>,
): Array<{ productId: string; pickupLocationId: string }> {
  return Object.entries(selectedByProductId ?? {})
    .filter(([productId, locationId]) => productId && locationId)
    .map(([productId, pickupLocationId]) => ({ productId, pickupLocationId }));
}
