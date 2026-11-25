/**
 * Отступы catalog browser landing.
 * Паритет web `CatalogFeedTilesGrid.css` (1rem = 16).
 */
export const CATALOG_BROWSER_LANDING_LAYOUT = {
  /** web `.catalog-feed-tiles` `padding-top: 0.5rem` */
  feedPaddingTop: 8,
  /** web `.catalog-feed-tiles` `margin-bottom: 0.75rem` */
  feedMarginBottom: 12,
  /** web `.catalog-browser-landing__categories` `margin-top: 1.15rem` */
  categoriesMarginTop: 18.4,
  /** web `.catalog-browser-landing__categories` `padding-top: 0.35rem` */
  categoriesPaddingTop: 5.6,
  /** web title `margin: 0.65rem 0 0.95rem` */
  titleMarginTop: 10.4,
  titleMarginBottom: 15.2,
  /** web title `gap: 0.55rem` */
  titleGap: 8.8,
  /** web `::before` `width: 0.22rem` */
  titleAccentWidth: 3.5,
  /** web `::before` `height: 1.05em` × feed title 22 */
  titleAccentHeightFeed: 23.1,
  /** web `::before` `height: 1.05em` × categories title 20 */
  titleAccentHeightCategories: 21,
  /** web `::before` `border-radius: 999px` */
  titleAccentRadius: 999,
} as const;

export type CatalogBrowserLandingSectionVariant = "feed" | "categories";
