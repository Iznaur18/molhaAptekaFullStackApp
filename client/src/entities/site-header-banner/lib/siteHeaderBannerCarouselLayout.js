import { SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX } from "@molha/api-contract";

/**
 * @param {number} viewportWidth
 */
export function resolveSiteHeaderBannerCarouselMetrics(viewportWidth) {
  const gapWidth = SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX;

  if (viewportWidth <= 0) {
    return {
      gapWidth,
      slideWidth: 0,
      stride: 0,
    };
  }

  const slideWidth = Math.max(viewportWidth, 1);
  const stride = slideWidth + gapWidth;

  return {
    gapWidth,
    slideWidth,
    stride,
  };
}

/**
 * @param {number} offsetX
 * @param {number} stride
 * @param {number} slideCount
 */
export function resolveSiteHeaderBannerCarouselIndex(offsetX, stride, slideCount) {
  if (stride <= 0 || slideCount <= 0) {
    return 0;
  }

  const nextIndex = Math.round(offsetX / stride);
  return Math.min(Math.max(nextIndex, 0), slideCount - 1);
}
