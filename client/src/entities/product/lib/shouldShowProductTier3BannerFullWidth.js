import { isProductTier3BannerPromotion } from "./isProductTier3BannerPromotion.js";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 * @param {{ isMineMode?: boolean; showFullWidthTier3Banners?: boolean }} options
 */
export function shouldShowProductTier3BannerFullWidth(
  product,
  { isMineMode = false, showFullWidthTier3Banners = false } = {},
) {
  if (!isProductTier3BannerPromotion(product)) {
    return false;
  }
  if (isMineMode) {
    return true;
  }
  return showFullWidthTier3Banners;
}
