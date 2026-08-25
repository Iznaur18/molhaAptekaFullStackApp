/**
 * Отступы catalog browser landing.
 * Сжатые значения между секциями (feed → магазины → категории).
 */
export const CATALOG_BROWSER_LANDING_LAYOUT = {
  feedPaddingTop: 4,
  feedMarginBottom: 0,
  /** Между блоками: только mt следующей секции. */
  categoriesMarginTop: 10,
  categoriesPaddingTop: 0,
  titleMarginTop: 0,
  titleMarginBottom: 8,
  titleAccentWidth: 3.5,
} as const;

export type CatalogBrowserLandingSectionVariant = "feed" | "categories";
