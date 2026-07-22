import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";

export type HomeCatalogFeedListRow =
  | { kind: "feed-header"; key: "home-feed-header" }
  | { kind: "product"; key: string; row: CatalogGridRow };

/**
 * Deprecated: поиск в absolute overlay, sticky больше не используется.
 * Экспорт оставлен — иначе Metro HMR падает с
 * `Property "HOME_CATALOG_FEED_STICKY_SEARCH_INDEX" doesn't exist`.
 */
export const HOME_CATALOG_FEED_STICKY_SEARCH_INDEX = 0;

/** Meta-строки в data (только feed-header). */
export const HOME_CATALOG_FEED_META_ROW_COUNT = 1;

export const buildHomeCatalogFeedListRows = (
  productRows: CatalogGridRow[],
): HomeCatalogFeedListRow[] => [
  { kind: "feed-header", key: "home-feed-header" },
  ...productRows.map((row) => ({ kind: "product" as const, key: row.key, row })),
];
