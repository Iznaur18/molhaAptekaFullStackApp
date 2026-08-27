/** Паритет `client/.../productDetailsPageLayoutConstants.js`. */
export const PRODUCT_DETAILS_PAGE_SPLIT_MIN_PX = 767;

/** Паритет `productImageTokens.css` @641px — увеличенная колонка фото. */
export const PRODUCT_DETAILS_IMAGE_WIDE_MIN_PX = 641;

/** Паритет `productDetailsModalTokens.css` — `--product-details-modal-gap`. */
export const PRODUCT_DETAILS_MODAL_GAP = 12;

/** Паритет web `7.25rem`. */
export const PRODUCT_DETAILS_MOBILE_DOCK_MAX_HEIGHT = 116;

/** Паритет web scroll-padding extra после dock. */
export const PRODUCT_DETAILS_MOBILE_DOCK_SCROLL_EXTRA = 8;

/** Паритет web `@media (min-width: 600px)` page shell radius. */
export const PRODUCT_DETAILS_PAGE_SHELL_RADIUS = 28;

export type ProductDetailHeroSize = {
  width: number | "100%";
  aspectRatio: number;
  alignSelf: "stretch" | "flex-start";
};

export const resolveProductDetailImageColumnWidth = (viewportWidth: number): number => {
  const isWideImage = viewportWidth >= PRODUCT_DETAILS_IMAGE_WIDE_MIN_PX;
  const maxSide = isWideImage ? 360 : 240;
  const ratio = isWideImage ? 0.63 : 0.42;
  return Math.min(maxSide, Math.round(viewportWidth * ratio));
};

export const resolveProductDetailPageSplit = (viewportWidth: number): boolean =>
  viewportWidth >= PRODUCT_DETAILS_PAGE_SPLIT_MIN_PX;

export const resolveProductDetailPageShellRounded = (viewportWidth: number): boolean =>
  viewportWidth >= 600;

export const resolveProductDetailHeroSize = (
  viewportWidth: number,
  isPageSplit = false,
): ProductDetailHeroSize => {
  if (!isPageSplit) {
    return {
      width: "100%",
      aspectRatio: 1,
      alignSelf: "stretch",
    };
  }

  const columnWidth = resolveProductDetailImageColumnWidth(viewportWidth);
  return {
    width: columnWidth,
    aspectRatio: 1,
    alignSelf: "flex-start",
  };
};

export const resolveProductDetailDockScrollPadding = (
  bottomInset: number,
  showMobileDock: boolean,
): number => {
  if (!showMobileDock) {
    return 32;
  }
  return (
    PRODUCT_DETAILS_MOBILE_DOCK_MAX_HEIGHT +
    PRODUCT_DETAILS_MOBILE_DOCK_SCROLL_EXTRA +
    Math.max(0, bottomInset)
  );
};

/** @deprecated используйте resolveProductDetailDockScrollPadding */
export const PRODUCT_DETAIL_DOCK_SCROLL_PADDING = 100;
