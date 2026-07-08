import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";

export type HomeCatalogFeedListRow =
  | { kind: "cap"; key: "home-feed-cap" }
  | { kind: "search"; key: "home-feed-search" }
  | { kind: "feed-header"; key: "home-feed-header" }
  | { kind: "product"; key: string; row: CatalogGridRow };

/** Индекс sticky-строки поиска в data FlatList (после cap-row). */
export const HOME_CATALOG_FEED_STICKY_SEARCH_INDEX = 1;

export const HOME_CATALOG_FEED_META_ROW_COUNT = 3;

export const buildHomeCatalogFeedListRows = (
  productRows: CatalogGridRow[],
): HomeCatalogFeedListRow[] => [
  { kind: "cap", key: "home-feed-cap" },
  { kind: "search", key: "home-feed-search" },
  { kind: "feed-header", key: "home-feed-header" },
  ...productRows.map((row) => ({ kind: "product" as const, key: row.key, row })),
];
