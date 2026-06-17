export const CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX = 10;
export const CURATED_PRODUCT_LIST_HOME_CARD_GAP = 8;
export const CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH = 86;
export const CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH = 168;
export const CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_X = 0;

/** Синхронизировано с CuratedProductListCarousel.css clamp() */
export const resolveCuratedCompactCardWidth = (scrollContainerWidth: number): number => {
  const gapTotal =
    CURATED_PRODUCT_LIST_HOME_CARD_GAP * (CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX - 1);
  const fromVisible =
    (scrollContainerWidth - gapTotal) / CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX;

  return Math.min(
    CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH,
    Math.max(CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH, fromVisible),
  );
};

