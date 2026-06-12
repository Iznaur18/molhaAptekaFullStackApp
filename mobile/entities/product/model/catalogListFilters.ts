export type CatalogListFilters = {
  view: "main";
  search?: string;
  productCategory?: string;
  categoryId?: string;
};

export const buildCatalogListQueryKey = (filters: CatalogListFilters) => ({
  view: filters.view,
  search: filters.search?.trim() || undefined,
  productCategory: filters.productCategory?.trim() || undefined,
  categoryId: filters.categoryId?.trim() || undefined,
});
