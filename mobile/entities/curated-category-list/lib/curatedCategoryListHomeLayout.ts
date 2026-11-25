/** Паритет с web `curatedCategoryListHomeLayout.js` + `CuratedCategoryListCarousel.css`. */
import {
  CURATED_PRODUCT_LIST_HOME_CARD_GAP,
  CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_HORIZONTAL,
} from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";

export const CURATED_CATEGORY_LIST_HOME_CARD_GAP = CURATED_PRODUCT_LIST_HOME_CARD_GAP;

/** Web `--curated-visible-cards: 2.2`. */
export const CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX = 2.2;

/** Web `--curated-card-min-width: 200px`. */
export const CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH = 200;

/** Web `--curated-card-max-width: 280px`. */
export const CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH = 280;

/**
 * Карусель на главной: web `.curated-category-list-carousel …__image-wrap { aspect-ratio: 4 / 3 }`.
 * Sheet остаётся 2:1 (дефолт карточки).
 */
export const CURATED_CATEGORY_LIST_HOME_CAROUSEL_IMAGE_ASPECT = 4 / 3;

/** Sheet / дефолт web `.curated-category-compact-card__image-wrap { aspect-ratio: 2 / 1 }`. */
export const CURATED_CATEGORY_LIST_SHEET_IMAGE_ASPECT = 2;

/** Синхронизировано с CuratedCategoryListCarousel.css clamp() (web). */
export const resolveCuratedCategoryCompactCardWidth = (
  scrollContainerWidth: number,
): number => {
  const padX = CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_HORIZONTAL;
  const gapTotal =
    CURATED_CATEGORY_LIST_HOME_CARD_GAP *
    (CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX - 1);
  const fromVisible =
    (scrollContainerWidth - 2 * padX - gapTotal) /
    CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX;

  return Math.min(
    CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH,
    Math.max(CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH, fromVisible),
  );
};

/** Высота трека HorizontalOverflowRow для карусели (4:3). */
export const resolveCuratedCategoryCompactCardHeight = (cardWidth: number): number =>
  cardWidth / CURATED_CATEGORY_LIST_HOME_CAROUSEL_IMAGE_ASPECT;
