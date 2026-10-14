import { applyCatalogFiltersDraft } from "@izibuy/shared-lib";

import { buildCatalogListQueryParams } from "../../../entities/product/lib/buildCatalogListQueryParams.js";

// Черновик окна общий с приложением — живёт в shared-lib.
export {
  applyCatalogFiltersDraft,
  areCatalogFiltersDraftsEqual,
  buildCatalogPricePresets,
  CATALOG_FILTERS_BENEFIT_FLAGS,
  CATALOG_FILTERS_DRAFT_FLAG_KEYS,
  CATALOG_FILTERS_MORE_FLAGS,
  CATALOG_FILTERS_RATING_MIN,
  CATALOG_FILTERS_SELLER_FLAGS,
  CATALOG_FILTERS_SHEET_SORTS,
  createCatalogFiltersDraft,
  createEmptyCatalogFiltersDraft,
  isCatalogFiltersDraftEmpty,
  isCatalogPricePresetSelected,
  toggleCatalogFiltersDelivery,
  toggleCatalogFiltersRating,
  toggleCatalogPricePreset,
} from "@izibuy/shared-lib";

/** @typedef {import("@izibuy/shared-lib").CatalogFiltersDraft} CatalogFiltersDraft */

/**
 * Параметры `GET /product/facets` для черновика — через тот же построитель,
 * что и выдача, чтобы число на кнопке совпало с тем, что покажет лента.
 *
 * @param {{
 *   query: Record<string, unknown>;
 *   draft: CatalogFiltersDraft;
 *   searchTerm: string;
 *   viewerRegionCode?: string | null;
 *   isCatalogBrowserMainViewActive: boolean;
 *   isSubcategoryFilterEnabled: boolean;
 * }} input
 */
export function buildCatalogFiltersFacetsParams({
  query,
  draft,
  searchTerm,
  viewerRegionCode = null,
  isCatalogBrowserMainViewActive,
  isSubcategoryFilterEnabled,
}) {
  const nextQuery = applyCatalogFiltersDraft(query, draft);
  const {
    scope: _scope,
    moderationStatus: _moderationStatus,
    // Порядок выдачи на счётчики не влияет — смена сортировки не перезапрашивает фасеты.
    sort: _sort,
    ...params
  } = buildCatalogListQueryParams({
    isMineMode: false,
    isCatalogBrowserMainViewActive,
    activeCatalogBrowserCategory: nextQuery.category ?? null,
    activeCatalogBrowserCategoryId: isSubcategoryFilterEnabled
      ? (nextQuery.categoryId ?? null)
      : null,
    catalogQueryFromUrl: nextQuery,
    appliedProductSearchTerm: searchTerm,
    selectedProductCategory: null,
    catalogSort: null,
    myProductsModerationFilter: null,
    viewerRegionCode: viewerRegionCode || null,
  });
  return params;
}
