/**
 * Паритет web `.product-card--list` (`ProductCardListLayout.css`, 1rem = 16).
 * Используется MyProduct / moderation queue compact cards.
 */
export const PRODUCT_COMPACT_CARD_LAYOUT = {
  /** `gap: 0.55rem` */
  cardGap: 8.8,
  /** `padding: 0.6rem 0.7rem` */
  paddingVertical: 9.6,
  paddingHorizontal: 11.2,
  /** `--product-card-radius: 20px` на list */
  cardRadius: 20,
  /** thumb `width: 112px` (≥641); @≤640 web → 96 */
  thumbSize: 112,
  thumbSizeNarrow: 96,
  thumbNarrowMaxWidth: 640,
  /** thumb `border-radius: 16px` */
  thumbRadius: 16,
  /** body `gap: 0.5rem 0.75rem` — column gap между thumb и summary */
  topRowGap: 12,
} as const;

export type ProductCompactCardLayout = typeof PRODUCT_COMPACT_CARD_LAYOUT;

export const resolveProductCompactCardThumbSize = (screenWidth: number): number =>
  screenWidth <= PRODUCT_COMPACT_CARD_LAYOUT.thumbNarrowMaxWidth
    ? PRODUCT_COMPACT_CARD_LAYOUT.thumbSizeNarrow
    : PRODUCT_COMPACT_CARD_LAYOUT.thumbSize;
