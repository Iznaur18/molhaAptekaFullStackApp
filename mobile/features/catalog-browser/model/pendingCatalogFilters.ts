import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";

let pendingFilters: CatalogListFilters | null = null;

export const setPendingCatalogFilters = (filters: CatalogListFilters): void => {
  pendingFilters = filters;
};

export const consumePendingCatalogFilters = (): CatalogListFilters | null => {
  const next = pendingFilters;
  pendingFilters = null;
  return next;
};
