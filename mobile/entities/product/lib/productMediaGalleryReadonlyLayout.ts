/** Паритет `ProductMediaGalleryReadonly.css` + `productImageTokens.css`. */
export const PRODUCT_MEDIA_GALLERY_READONLY_LAYOUT = {
  /** `--product-image-thumb-side` (4rem @ 16px). */
  thumbSize: 64,
  /** `.product-media-gallery-readonly__thumbs` gap (0.4rem). */
  thumbGap: 6.4,
  /** `.product-media-gallery-readonly__thumb` border (2px). */
  thumbBorderWidth: 2,
  /** 22% squircle radius on thumb side. */
  thumbBorderRadius: 14.08,
  /** 28% squircle radius when `corner-shape: squircle`. */
  thumbSquircleRadius: 17.92,
  /** `.product-media-gallery-readonly__thumb-video` (1.1rem). */
  thumbVideoFontSize: 17.6,
  /** `.product-details-modal--page .product-media-gallery-readonly__thumbs`. */
  thumbsPaddingInlinePage: 2.4,
  /** `.product-details-modal--page-split .product-media-gallery-readonly__thumbs`. */
  thumbsPaddingInlineSplit: 0,
} as const;
