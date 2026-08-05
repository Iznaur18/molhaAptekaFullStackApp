export type CheckoutPickupLocation = {
  address: string;
  productTitles: string[];
};

type PickupLineLike = {
  product?: {
    productPickupAddress?: string | null;
    productName?: string | null;
  } | null;
};

/** Unique pickup points for checkout, grouped by address with product titles. */
export function buildCheckoutPickupLocations(
  lines: PickupLineLike[] | null | undefined,
): CheckoutPickupLocation[] {
  const byAddress = new Map<string, CheckoutPickupLocation>();

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
