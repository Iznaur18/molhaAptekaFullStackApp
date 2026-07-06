/** Пиксель-паритет с `client/.../product-card/ProductCardMobileCatalog.css` (1rem = 16px). */
export const PRODUCT_CARD_MOBILE_CATALOG_LAYOUT = {
  bottomPadding: 10,
  contentInsetX: 8,
  bodyGap: 4,
  headingHeight: 20,
  priceHeight: 21,
  metaHeight: 46,
  sellerRowHeight: 13.5,
  nameFontSize: 14,
  nameLineHeight: 20,
  ratingFontSize: 12,
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
