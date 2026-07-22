import { PRODUCT_CARD_UI } from "@/shared/config";

import {
  resolveProductListingOriginPresentation,
  type ProductListingOriginIconName,
} from "./productListingOrigin";

export type ProductDetailsBadgeItem = {
  key: string;
  label: string;
} & (
  | { kind: "raffle" }
  | { kind: "listingOrigin"; iconName: ProductListingOriginIconName }
);

type BuildProductDetailsBadgeItemsInput = {
  product: Record<string, unknown>;
};

export const sortProductDetailsBadgesByLabelLength = <
  T extends { key: string; label: string },
>(
  items: readonly T[],
): T[] =>
  [...items].sort((left, right) => {
    const byLength = left.label.length - right.label.length;
    if (byLength !== 0) {
      return byLength;
    }
    return left.key.localeCompare(right.key);
  });

export const buildProductDetailsBadgeItems = ({
  product,
}: BuildProductDetailsBadgeItemsInput): ProductDetailsBadgeItem[] => {
  const items: ProductDetailsBadgeItem[] = [];

  if (
    Boolean(product.activeRaffleId) &&
    Boolean(product.raffleParticipationEnabledAt)
  ) {
    items.push({
      key: "raffle",
      kind: "raffle",
      label: PRODUCT_CARD_UI.RAFFLE_BADGE,
    });
  }

  const listingOrigin = resolveProductListingOriginPresentation(
    product.productListingOrigin,
  );
  items.push({
    key: "listing-origin",
    kind: "listingOrigin",
    iconName: listingOrigin.iconName,
    label: listingOrigin.label,
  });

  return sortProductDetailsBadgesByLabelLength(items);
};
