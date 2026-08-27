/** Пиксель-паритет с `client/.../product-card/ProductCardMobileCatalog.css` (1rem = 16px). */
export const PRODUCT_CARD_MOBILE_CATALOG_LAYOUT = {
  bottomPadding: 10,
  contentInsetX: 10,
  bodyGap: 4,
  /** `--product-card-radius` 16px − 1px */
  imageTopRadius: 15,
  /** `--product-card-inner-radius` (= radius * 10/16) */
  imageBottomRadius: 10,
  headingHeight: 20,
  priceHeight: 21,
  metaHeight: 38,
  sellerRowHeight: 16,
  sellerFontSize: 11.5,
  sellerLineHeight: 16,
  nameFontSize: 14,
  nameLineHeight: 20,
  ratingFontSize: 12,
  ratingLineHeight: 20,
  priceColumnGap: 5.6,
  priceRowGap: 3.2,
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

/** Высота квадратного фото с bleed (−inset по X → width = tile + 2×inset). */
export const resolveProductCardCatalogGridImageHeight = (
  tileWidth: number,
  layout: ProductCardMobileCatalogLayout = PRODUCT_CARD_MOBILE_CATALOG_LAYOUT,
): number => Math.max(0, tileWidth) + 2 * layout.contentInsetX;

/** Квадратное фото + текстовый стек + нижний padding — паритет web `.app-shell__cell`. */
export const resolveProductCardCatalogGridTotalHeight = (
  tileWidth: number,
  layout: ProductCardMobileCatalogLayout = PRODUCT_CARD_MOBILE_CATALOG_LAYOUT,
): number =>
  resolveProductCardCatalogGridImageHeight(tileWidth, layout) +
  resolveProductCardCatalogGridContentBelowImageHeight(layout) +
  layout.bottomPadding;
