/** SSOT: `contract/src/productWrite.js`. */
export { PRODUCT_IMAGE_URLS_MAX } from "@molha/api-contract";

/** Inline SVG — parity with web `PRODUCT_IMAGE_PLACEHOLDER_URL`. */
export const PRODUCT_IMAGE_PLACEHOLDER_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23dbeafe'/%3E%3Cdefs%3E%3Cpattern id='d' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='10' cy='10' r='2.5' fill='%2360a5fa' opacity='.55'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23d)'/%3E%3C/svg%3E";

/** Web `--product-image-thumb-side` (4rem @ 16px). */
export const ORDER_CARD_ITEM_THUMB_SIZE = 64;

export {
  PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
  PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO as PRODUCT_MEDIA_HERO_ASPECT_RATIO,
} from "@izibuy/design-tokens";
