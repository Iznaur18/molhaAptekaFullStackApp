/** Паритет с web `curatedCategoryListHomeLayout.js`. */
import {
  CURATED_PRODUCT_LIST_HOME_CARD_GAP,
  CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX,
} from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";

/** Превью 2:1 — в 2 раза шире карточки товара. */
export const CURATED_CATEGORY_LIST_HOME_CARD_WIDTH_SCALE = 2;

export const CURATED_CATEGORY_LIST_HOME_CARD_GAP = CURATED_PRODUCT_LIST_HOME_CARD_GAP;

export const CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX = Math.max(
  1,
  Math.round(
    CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX /
      CURATED_CATEGORY_LIST_HOME_CARD_WIDTH_SCALE,
  ),
);

export const CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH = 172;
export const CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH = 336;

/** Синхронизировано с CuratedCategoryListCarousel.css clamp() (web). */
export const resolveCuratedCategoryCompactCardWidth = (
  scrollContainerWidth: number,
): number => {
  const gapTotal =
    CURATED_CATEGORY_LIST_HOME_CARD_GAP *
    (CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX - 1);
  const fromVisible =
    (scrollContainerWidth - gapTotal) / CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX;

  return Math.min(
    CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH,
    Math.max(CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH, fromVisible),
  );
};
