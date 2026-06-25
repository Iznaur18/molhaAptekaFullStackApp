import { useCallback } from "react";

import type { HomeCatalogFeedFiltersState } from "@/features/home-feed/model/homeCatalogFeedFilters";

type ResetHomeCatalogFiltersParams = {
  setSearchInput: (value: string) => void;
  setDebouncedSearch: (value: string) => void;
  setSelectedRootSlug: (value: string | null) => void;
  setSelectedSubcategoryId: (value: string | null) => void;
  setSelectedSellerPersonalCategoryId: (value: string | null) => void;
  setFeedFilters: (value: HomeCatalogFeedFiltersState) => void;
  setCatalogAllCities?: (value: boolean) => void;
  emptyFeedFilters: HomeCatalogFeedFiltersState;
};

export const useResetHomeCatalogFilters = ({
  setSearchInput,
  setDebouncedSearch,
  setSelectedRootSlug,
  setSelectedSubcategoryId,
  setSelectedSellerPersonalCategoryId,
  setFeedFilters,
  setCatalogAllCities,
  emptyFeedFilters,
}: ResetHomeCatalogFiltersParams) =>
  useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedRootSlug(null);
    setSelectedSubcategoryId(null);
    setSelectedSellerPersonalCategoryId(null);
    setFeedFilters(emptyFeedFilters);
    setCatalogAllCities?.(false);
  }, [
    emptyFeedFilters,
    setCatalogAllCities,
    setDebouncedSearch,
    setFeedFilters,
    setSearchInput,
    setSelectedRootSlug,
    setSelectedSubcategoryId,
    setSelectedSellerPersonalCategoryId,
  ]);
