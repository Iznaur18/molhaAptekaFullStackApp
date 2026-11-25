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
  /** `--product-card-mobile-cart-height` 2.15rem — «В корзину» / «Записаться» на главной. */
  actionHeight: 34.4,
  /** До 1023 px над кнопкой 0.5rem — «В корзину» не липнет к строке продавца. */
  actionTopGap: 8,
} as const;

/** `@media (max-width: 1023px)` в ProductCardMobileCatalog.css кончается здесь. */
export const PRODUCT_CARD_DESKTOP_MIN_WIDTH = 1024;

/**
 * Шире 1023px: `.product-card` padding `0.55rem 0.75rem 0.65rem`, gap `0.4rem`.
 * Тело `0.32rem`. Bleed картинки: `--iz-space-2` и `0.38rem`.
 */
export const PRODUCT_CARD_DESKTOP_LAYOUT = {
  paddingTop: 8.8,
  paddingHorizontal: 12,
  paddingBottom: 10.4,
  cardGap: 6.4,
  bodyGap: 5.12,
  imageBleedX: 8,
  imageBleedTop: 6.08,
  /** `--product-card-radius` 16 − 2 */
  imageTopRadius: 14,
  imageBottomRadius: 10,
} as const;

export type ProductCardMobileCatalogLayout = typeof PRODUCT_CARD_MOBILE_CATALOG_LAYOUT;

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
 * Высота квадратного фото 1:1 по ширине тайла.
 * Web mobile: `--product-card-image-bleed-x: 0` — превью = ширина карточки
 * (negative margin только гасит padding текста, наружу не вылезает).
 */
export const resolveProductCardCatalogGridImageHeight = (
  tileWidth: number,
  _layout: ProductCardMobileCatalogLayout = PRODUCT_CARD_MOBILE_CATALOG_LAYOUT,
): number => Math.max(0, tileWidth);

/** Место под кнопку покупки или заявки на карточке главного экрана. */
export const resolveProductCardCatalogGridActionSlotHeight = (
  layout: ProductCardMobileCatalogLayout = PRODUCT_CARD_MOBILE_CATALOG_LAYOUT,
): number => layout.actionTopGap + layout.actionHeight;

/**
 * Квадратное фото + текстовый стек + нижний padding — паритет web `.app-shell__cell`.
 * `withAction` — главный экран: под текстом кнопка, все карточки ряда одной высоты.
 */
export const resolveProductCardCatalogGridTotalHeight = (
  tileWidth: number,
  layout: ProductCardMobileCatalogLayout = PRODUCT_CARD_MOBILE_CATALOG_LAYOUT,
  { withAction = false }: { withAction?: boolean } = {},
): number =>
  resolveProductCardCatalogGridImageHeight(tileWidth, layout) +
  resolveProductCardCatalogGridContentBelowImageHeight(layout) +
  (withAction ? resolveProductCardCatalogGridActionSlotHeight(layout) : 0) +
  layout.bottomPadding;
