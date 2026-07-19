import { type ProductCardPromotionTier } from "./productCardPromotionFramePalette";
import { isCatalogPromotionActive } from "./productPromotionStatus";

type PromotionChromeProduct = Record<string, unknown>;

type ResolveProductCardPromotionChromeOptions = {
  highlightCatalogPromotion?: boolean;
  isMineMode?: boolean;
  isModerationQueue?: boolean;
};

export const resolveProductCardPromotionChrome = (
  product: PromotionChromeProduct,
  {
    highlightCatalogPromotion = true,
    isMineMode = false,
    isModerationQueue = false,
  }: ResolveProductCardPromotionChromeOptions = {},
) => {
  const isPromotionActive = isCatalogPromotionActive(product);
  const promotionTier = Number(product.catalogPromotionTier) || 0;

  const showPromotionChrome =
    highlightCatalogPromotion &&
    !isMineMode &&
    !isModerationQueue &&
    isPromotionActive &&
    promotionTier > 0;

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
