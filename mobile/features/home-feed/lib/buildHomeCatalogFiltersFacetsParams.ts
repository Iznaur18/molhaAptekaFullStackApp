import type { CatalogFiltersDraft } from "@izibuy/shared-lib";

import type { CatalogProductsRequestOptions } from "../../../entities/product/api/fetchCatalogProductsPage";
import type { CatalogListFilters } from "../../../entities/product/model/catalogListFilters";
import {
  EMPTY_HOME_CATALOG_FEED_FILTERS,
  homeCatalogFeedFiltersFromDraft,
} from "../model/homeCatalogFeedFilters";

/**
 * Параметры `GET /product/facets` для черновика окна: поиск, категория и регион —
 * как у ленты, фильтры — из черновика. Порядок выдачи на счётчики не влияет,
 * поэтому смена сортировки фасеты не перезапрашивает (как на web).
 */
export const buildHomeCatalogFiltersFacetsParams = (
  applied: CatalogListFilters,
  draft: CatalogFiltersDraft,
): CatalogProductsRequestOptions => {
  const { view: _view, sort: _sort, ...base } = applied;
  const { sort: _draftSort, ...filters } = homeCatalogFeedFiltersFromDraft(
    draft,
    EMPTY_HOME_CATALOG_FEED_FILTERS,
  );
  return { ...base, ...filters };
};
