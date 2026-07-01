import {
  SITE_HEADER_BANNER_CAROUSEL_PEEK_PX,
  SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX,
} from "@molha/api-contract";

export const resolveSiteHeaderBannerCarouselMetrics = (viewportWidth: number) => {
  const peekWidth = SITE_HEADER_BANNER_CAROUSEL_PEEK_PX;
  const gapWidth = SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX;

  if (viewportWidth <= 0) {
    return {
      peekWidth,
      gapWidth,
      slideWidth: 0,
      stride: 0,
    };
  }

  const slideWidth = Math.max(viewportWidth - peekWidth, 1);
  const stride = slideWidth + gapWidth;

  return {
    peekWidth,
    gapWidth,
    slideWidth,
    stride,
  };
};

export const resolveSiteHeaderBannerCarouselIndex = (
  offsetX: number,
  stride: number,
  slideCount: number,
): number => {
  if (stride <= 0 || slideCount <= 0) {
    return 0;
  }

  const nextIndex = Math.round(offsetX / stride);
  return Math.min(Math.max(nextIndex, 0), slideCount - 1);
};
