import { isProductPromotionVisibleInViewerRegion } from "@izibuy/shared-lib";
import { type ProductCardPromotionTier } from "./productCardPromotionFramePalette";
import { isCatalogPromotionActive } from "./productPromotionStatus";

type PromotionChromeProduct = Record<string, unknown>;

type ResolveProductCardPromotionChromeOptions = {
  highlightCatalogPromotion?: boolean;
  isMineMode?: boolean;
  isModerationQueue?: boolean;
  /** Если true — chrome только при совпадении региона (редко; по умолчанию chrome везде). */
  requireViewerRegionMatch?: boolean;
  viewerRegionCode?: string | null;
};

export const resolveProductCardPromotionChrome = (
  product: PromotionChromeProduct,
  {
    highlightCatalogPromotion = true,
    isMineMode = false,
    isModerationQueue = false,
    requireViewerRegionMatch = false,
    viewerRegionCode = null,
  }: ResolveProductCardPromotionChromeOptions = {},
) => {
  const isPromotionActive = isCatalogPromotionActive(product);
  const promotionTier = Number(product.catalogPromotionTier) || 0;

  const regionOk =
    !requireViewerRegionMatch ||
    isProductPromotionVisibleInViewerRegion(product, viewerRegionCode);

  const showPromotionChrome =
    highlightCatalogPromotion &&
    !isMineMode &&
    !isModerationQueue &&
    isPromotionActive &&
    promotionTier > 0 &&
    regionOk;

  const resolvedTier = showPromotionChrome
    ? (promotionTier as ProductCardPromotionTier)
    : null;

  return {
    isPromotionActive,
    promotionTier,
    showPromotionChrome,
    promotionFrameTier: resolvedTier,
  };
};
