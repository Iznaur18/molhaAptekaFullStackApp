import { PRODUCT_PRICE_MARKET_STATUS_UNKNOWN } from "@molha/api-contract";

import { PRODUCT_CARD_UI, PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";

import { isProductOriginalBadgeVisible } from "./productIsOriginal";
import {
  resolveProductListingOriginPresentation,
  type ProductListingOriginIconName,
} from "./productListingOrigin";
import { resolveProductPriceMarketStatusPresentation } from "./productPriceMarketStatus";

export type ProductDetailsBadgeItem = {
  key: string;
  label: string;
} & (
  | { kind: "original" }
  | { kind: "raffle" }
  | { kind: "listingOrigin"; iconName: ProductListingOriginIconName }
  | { kind: "priceMarket"; backgroundColor: string; color: string }
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

  if (isProductOriginalBadgeVisible(product.productIsOriginal)) {
    items.push({
      key: "original",
      kind: "original",
      label: PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE,
    });
  }

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

  const priceMarket = resolveProductPriceMarketStatusPresentation(
    product.productPriceMarketStatus,
  );
  if (priceMarket.status !== PRODUCT_PRICE_MARKET_STATUS_UNKNOWN) {
    items.push({
      key: "price-market",
      kind: "priceMarket",
      label: priceMarket.label,
      backgroundColor: priceMarket.backgroundColor,
      color: priceMarket.color,
    });
  }

  return sortProductDetailsBadgesByLabelLength(items);
};
