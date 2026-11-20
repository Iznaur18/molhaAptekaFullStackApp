/**
 * Паритет web `CuratedListViewAllSheet.css` + carousel `__view-all` / `__header`.
 */
import {
  CURATED_PRODUCT_LIST_HOME_CARD_GAP,
  CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH,
  CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH,
} from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import { CURATED_CATEGORY_LIST_HOME_CARD_GAP } from "@/entities/curated-category-list/lib/curatedCategoryListHomeLayout";

export const CURATED_LIST_VIEW_ALL_BUTTON = {
  paddingVertical: 6,
  paddingHorizontal: 12,
  gap: 4,
  fontSize: 12,
  fontWeight: "600" as const,
  lineHeight: 14.4,
  iconSize: 14,
  iconStrokeWidth: 2.25,
} as const;

export const CURATED_LIST_HEADER = {
  gap: 12,
  marginBottom: 10,
  paddingHorizontal: 12,
} as const;

export const CURATED_LIST_VIEW_ALL_SHEET_LAYOUT = {
  maxHeightRatio: 0.85,
  minHeightRatio: 0.4,
  borderTopRadius: 32,
  bodyPadding: 16,
  bodyGap: 13.6,
  titleFontSize: 18,
  titleFontWeight: "700" as const,
  titleLineHeight: 24.3,
  productCardGap: CURATED_PRODUCT_LIST_HOME_CARD_GAP,
  productCardMinWidth: CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH,
  productCardMaxWidth: CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH,
  categoryCardGap: CURATED_CATEGORY_LIST_HOME_CARD_GAP,
  categoryPhoneColumns: 1,
} as const;

/** auto-fill minmax(min, 1fr) с cap max — как CSS grid sheet. */
export const resolveCuratedSheetProductCardWidth = (containerWidth: number): number => {
  const gap = CURATED_LIST_VIEW_ALL_SHEET_LAYOUT.productCardGap;
  const min = CURATED_LIST_VIEW_ALL_SHEET_LAYOUT.productCardMinWidth;
  const max = CURATED_LIST_VIEW_ALL_SHEET_LAYOUT.productCardMaxWidth;
  if (containerWidth <= 0) {
    return min;
  }
  const cols = Math.max(1, Math.floor((containerWidth + gap) / (min + gap)));
  const fromCols = (containerWidth - gap * (cols - 1)) / cols;
  return Math.min(max, Math.max(min, fromCols));
};
