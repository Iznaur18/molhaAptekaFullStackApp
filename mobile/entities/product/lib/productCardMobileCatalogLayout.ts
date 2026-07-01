/** Пиксель-паритет с `client/.../product-card/ProductCardMobileCatalog.css` (1rem = 16px). */
export const PRODUCT_CARD_MOBILE_CATALOG_LAYOUT = {
  fixedHeight: 430,
  bottomPadding: 7.2,
  contentInsetX: 8,
  bodyGap: 4,
  imageHeight: 273,
  headingHeight: 20,
  priceHeight: 21,
  metaHeight: 46,
  sellerRowHeight: 13.5,
  nameFontSize: 13.76,
  nameLineHeight: 20,
  ratingFontSize: 11.84,
  ratingLineHeight: 20,
} as const;

export type ProductCardMobileCatalogLayout =
  typeof PRODUCT_CARD_MOBILE_CATALOG_LAYOUT;

/** Фиксированная высота текстового стека под фото в catalog-grid. */
export const resolveProductCardCatalogGridContentBelowImageHeight = (
  layout: ProductCardMobileCatalogLayout = PRODUCT_CARD_MOBILE_CATALOG_LAYOUT,
): number =>
  layout.bodyGap +
  layout.headingHeight +
  layout.bodyGap +
  layout.priceHeight +
  layout.bodyGap +
  layout.metaHeight +
  layout.bodyGap +
  layout.sellerRowHeight;

/**
 * iOS native: fixedHeight рассчитан с web-запасом под «В корзину», которого в app нет.
 * Увеличиваем только фото — убираем пустую полосу внизу карточки.
 * Web / Android — прежний imageHeight (в браузере уже ок).
 */
export const resolveProductCardCatalogGridImageHeight = (
  platformOs: string,
  layout: ProductCardMobileCatalogLayout = PRODUCT_CARD_MOBILE_CATALOG_LAYOUT,
): number => {
  if (platformOs !== "ios") {
    return layout.imageHeight;
  }

  return Math.round(
    layout.fixedHeight -
      layout.bottomPadding -
      resolveProductCardCatalogGridContentBelowImageHeight(layout),
  );
};
