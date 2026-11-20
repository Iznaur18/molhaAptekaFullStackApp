/** Паритет web `BoostProductsHomeSection.css`: clamp(8.5rem, 23%, 11rem), gap 10. */
export const BOOST_HOME_CARD_GAP = 10;
export const BOOST_HOME_CARD_MIN_WIDTH = 136;
export const BOOST_HOME_CARD_MAX_WIDTH = 176;
export const BOOST_HOME_CARD_WIDTH_RATIO = 0.23;
export const BOOST_HOME_SECTION_PADDING = 14;
export const BOOST_HOME_SECTION_RADIUS = 28;
export const BOOST_HOME_HEADER_GAP = 10;
export const BOOST_HOME_HEADER_MARGIN_BOTTOM = 12;
export const BOOST_HOME_ICON_SIZE = 38;
export const BOOST_HOME_ICON_RADIUS = 12;
export const BOOST_HOME_ICON_GLYPH = 18;
export const BOOST_HOME_VIEW_ALL_ICON = 16;
export const BOOST_HOME_PRICE_INSET = 6;
export const BOOST_HOME_WISHLIST_INSET = 6;

export const resolveBoostHomeCardWidth = (scrollContainerWidth: number): number => {
  const fromRatio = scrollContainerWidth * BOOST_HOME_CARD_WIDTH_RATIO;
  return Math.min(
    BOOST_HOME_CARD_MAX_WIDTH,
    Math.max(BOOST_HOME_CARD_MIN_WIDTH, fromRatio),
  );
};

/** Мини-карточка: только 1:1 медиа (цена поверх). */
export const resolveBoostHomeCardHeight = (cardWidth: number): number => cardWidth;
