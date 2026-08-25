/**
 * Метрики карусели site-header banner.
 * Паритет web Embla: слайд = 100% viewport (без peek/gap).
 */

/** Клоны по краям: [last, ...slides, first]. Реальные слайды с индекса 1. */
export const SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES = 1;

/**
 * @param {number} viewportWidth
 */
export function resolveSiteHeaderBannerCarouselMetrics(viewportWidth) {
  if (viewportWidth <= 0) {
    return {
      gapWidth: 0,
      peekWidth: 0,
      sideInset: 0,
      slideWidth: 0,
      stride: 0,
    };
  }

  return {
    gapWidth: 0,
    peekWidth: 0,
    sideInset: 0,
    slideWidth: viewportWidth,
    stride: viewportWidth,
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

/**
 * @param {number} offsetX
 * @param {number} stride
 */
export function resolveSiteHeaderBannerCarouselLoopIndexFromOffset(offsetX, stride) {
  if (stride <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(offsetX / stride));
}

/**
 * @param {number} loopIndex
 * @param {number} slideCount
 */
export function resolveSiteHeaderBannerCarouselLoopLogicalIndex(loopIndex, slideCount) {
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
}

/**
 * @param {number} loopIndex
 * @param {number} slideCount
 * @returns {number | null}
 */
export function resolveSiteHeaderBannerCarouselLoopJumpTarget(loopIndex, slideCount) {
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
}

/**
 * @param {number} logicalIndex
 */
export function resolveSiteHeaderBannerCarouselLoopIndexFromLogical(logicalIndex) {
  return logicalIndex + SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES;
}
