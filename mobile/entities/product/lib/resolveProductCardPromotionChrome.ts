import {
  PRODUCT_CARD_PROMOTION_TIER,
  type ProductCardPromotionTier,
} from "./productCardPromotionFramePalette";
import { isCatalogPromotionActive } from "./productPromotionStatus";

type PromotionChromeProduct = Record<string, unknown>;

type ResolveProductCardPromotionChromeOptions = {
  highlightCatalogPromotion?: boolean;
  promotionFullWidth?: boolean;
  isMineMode?: boolean;
  isModerationQueue?: boolean;
};

export const resolveProductCardPromotionChrome = (
  product: PromotionChromeProduct,
  {
    highlightCatalogPromotion = true,
    promotionFullWidth = false,
    isMineMode = false,
    isModerationQueue = false,
  }: ResolveProductCardPromotionChromeOptions = {},
) => {
  const isPromotionActive = isCatalogPromotionActive(product);
  const promotionTier = Number(product.catalogPromotionTier) || 0;

  const showTier3BannerPreview =
    isMineMode &&
    promotionFullWidth &&
    isPromotionActive &&
    promotionTier === PRODUCT_CARD_PROMOTION_TIER.BANNER;

  const showPromotionChrome =
    (highlightCatalogPromotion &&
      !isMineMode &&
      !isModerationQueue &&
      isPromotionActive &&
      promotionTier > 0) ||
    showTier3BannerPreview;

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
