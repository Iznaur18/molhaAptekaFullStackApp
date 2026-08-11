import {
  formatCatalogNearDistanceLabel,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
} from "@molha/api-contract";
import {
  isProductRentalConfigured,
  isProductWholesaleConfigured,
} from "@izibuy/shared-lib";

import {
  PRODUCT_CARD_UI,
  PRODUCT_DETAILS_MODAL_UI,
  PRODUCT_PROMO_CODE_UI,
  PRODUCT_RENTAL_UI,
  PRODUCT_WHOLESALE_UI,
} from "@/shared/config";

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
  | { kind: "affiliate" }
  | { kind: "auction" }
  | { kind: "installment" }
  | { kind: "wholesale" }
  | { kind: "rental" }
  | { kind: "promo" }
  | { kind: "nearDistance" }
  | { kind: "listingOrigin"; origin: string | null; iconName: ProductListingOriginIconName }
  | { kind: "priceMarket"; priceMarketStatus: string; backgroundColor: string; color: string }
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

  const affiliatePercent = Math.floor(Number(product.affiliatePercent) || 0);
  if (product.affiliateEnabled === true && affiliatePercent > 0) {
    items.push({
      key: "affiliate",
      kind: "affiliate",
      label: PRODUCT_DETAILS_MODAL_UI.AFFILIATE_BADGE(affiliatePercent),
    });
  }

  if (product.productAuctionEnabled === true) {
    items.push({
      key: "auction",
      kind: "auction",
      label: PRODUCT_CARD_UI.AUCTION_BADGE,
    });
  }

  if (product.productInstallmentEnabled === true) {
    items.push({
      key: "installment",
      kind: "installment",
      label: PRODUCT_CARD_UI.INSTALLMENT_BADGE,
    });
  }

  if (
    product.productWholesaleEnabled === true &&
    isProductWholesaleConfigured(product)
  ) {
    items.push({
      key: "wholesale",
      kind: "wholesale",
      label: PRODUCT_WHOLESALE_UI.DETAILS_OFFER_KICKER,
    });
  }

  if (
    product.productRentalEnabled === true &&
    isProductRentalConfigured(product)
  ) {
    items.push({
      key: "rental",
      kind: "rental",
      label: PRODUCT_RENTAL_UI.DETAILS_BADGE,
    });
  }

  if (product.productHasActivePromoCodes === true) {
    items.push({
      key: "promo",
      kind: "promo",
      label: PRODUCT_PROMO_CODE_UI.DETAILS_BADGE,
    });
  }

  const nearDistanceLabel = formatCatalogNearDistanceLabel(
    product.distanceMeters as number | null | undefined,
  );
  if (nearDistanceLabel) {
    items.push({
      key: "near-distance",
      kind: "nearDistance",
      label: nearDistanceLabel,
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
    origin:
      typeof product.productListingOrigin === "string"
        ? product.productListingOrigin
        : null,
  });

  const priceMarket = resolveProductPriceMarketStatusPresentation(
    product.productPriceMarketStatus,
  );
  if (priceMarket.status !== PRODUCT_PRICE_MARKET_STATUS_UNKNOWN) {
    items.push({
      key: "price-market",
      kind: "priceMarket",
      label: priceMarket.label,
      priceMarketStatus: priceMarket.status,
      backgroundColor: priceMarket.backgroundColor,
      color: priceMarket.color,
    });
  }

  return sortProductDetailsBadgesByLabelLength(items);
};
