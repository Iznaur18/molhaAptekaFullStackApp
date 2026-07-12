import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";

export type HomeCatalogFeedListRow =
  | { kind: "search"; key: "home-feed-search" }
  | { kind: "feed-header"; key: "home-feed-header" }
  | { kind: "product"; key: string; row: CatalogGridRow };

/**
 * Индекс sticky-строки поиска в data FlatList. Интро (hero) больше не строка
 * списка — это отдельный задний слой, поэтому поиск идёт первым.
 */
export const HOME_CATALOG_FEED_STICKY_SEARCH_INDEX = 0;

export const HOME_CATALOG_FEED_META_ROW_COUNT = 2;

export const buildHomeCatalogFeedListRows = (
  productRows: CatalogGridRow[],
): HomeCatalogFeedListRow[] => [
  { kind: "search", key: "home-feed-search" },
  { kind: "feed-header", key: "home-feed-header" },
  ...productRows.map((row) => ({ kind: "product" as const, key: row.key, row })),
];
