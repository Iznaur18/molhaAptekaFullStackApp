/** Паритет с web `.user-stories-strip` / curated carousel section gap. */
import { HOME_FEED_SECTION_GAP } from "@/features/home-feed/lib/homeFeedSectionLayout";

export const CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX = 10;
export const CURATED_PRODUCT_LIST_HOME_CARD_GAP = 12;
export const CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH = 86;
export const CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH = 168;
export const CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_X = 0;
export const CURATED_PRODUCT_LIST_HOME_SECTION_MARGIN_BOTTOM = HOME_FEED_SECTION_GAP;
export const CURATED_PRODUCT_LIST_HOME_SECTION_BORDER_RADIUS = 28;
/** Web `.curated-product-list-carousel { padding: 12px 0 }` — без горизонтали на section. */
export const CURATED_PRODUCT_LIST_HOME_SECTION_PADDING_HORIZONTAL = 0;
export const CURATED_PRODUCT_LIST_HOME_SECTION_PADDING_VERTICAL = 12;
export const CURATED_PRODUCT_LIST_HOME_TITLE_MARGIN_BOTTOM = 10;
export const CURATED_PRODUCT_LIST_HOME_TITLE_PADDING_X = 4;
/** Web `.curated-product-list-carousel__track { padding: 0 12px }` — только на scroll row. */
export const CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_TOP = 0;
export const CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_BOTTOM = 0;
export const CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_HORIZONTAL = 12;

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

