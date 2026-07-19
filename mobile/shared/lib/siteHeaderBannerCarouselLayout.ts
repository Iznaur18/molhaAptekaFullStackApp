import {
  SITE_HEADER_BANNER_CAROUSEL_PEEK_PX,
  SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX,
} from "@molha/api-contract";

/** Клоны по краям: [last, ...slides, first]. Реальные слайды с индекса 1. */
export const SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES = 1;

export const resolveSiteHeaderBannerCarouselMetrics = (viewportWidth: number) => {
  const gapWidth = SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX;
  const peekWidth = SITE_HEADER_BANNER_CAROUSEL_PEEK_PX;

  if (viewportWidth <= 0) {
    return {
      gapWidth,
      peekWidth,
      sideInset: 0,
      slideWidth: 0,
      stride: 0,
    };
  }

  // peek слева и справа — активный слайд по центру.
  const sideInset = peekWidth;
  const slideWidth = Math.max(viewportWidth - sideInset * 2, 1);
  const stride = slideWidth + gapWidth;

  return {
    gapWidth,
    peekWidth,
    sideInset,
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

export const resolveSiteHeaderBannerCarouselLoopIndexFromOffset = (
  offsetX: number,
  stride: number,
): number => {
  if (stride <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(offsetX / stride));
};

export const resolveSiteHeaderBannerCarouselLoopLogicalIndex = (
  loopIndex: number,
  slideCount: number,
): number => {
  if (slideCount <= 0) {
    return 0;
  }

  if (loopIndex <= 0) {
    return slideCount - 1;
  }

  if (loopIndex >= slideCount + SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES) {
    return 0;
  }

  return loopIndex - SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES;
};

/** Без анимации прыгнуть на реальный слайд после клона. */
export const resolveSiteHeaderBannerCarouselLoopJumpTarget = (
  loopIndex: number,
  slideCount: number,
): number | null => {
  if (slideCount <= 1) {
    return null;
  }

  if (loopIndex <= 0) {
    return slideCount;
  }

  if (loopIndex >= slideCount + SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES) {
    return SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES;
  }

  return null;
};

export const resolveSiteHeaderBannerCarouselLoopIndexFromLogical = (
  logicalIndex: number,
): number => logicalIndex + SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES;
