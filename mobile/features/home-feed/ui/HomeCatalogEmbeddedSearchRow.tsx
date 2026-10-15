import { memo } from "react";

import { useHomeCatalogSearch } from "@/features/home-feed/model/HomeCatalogSearchContext";
import { HomeCatalogSearchRow } from "@/features/home-feed/ui/HomeCatalogSearchRow";

export const HomeCatalogEmbeddedSearchRow = memo(() => {
  const { value, onChange, onSubmit, filtersOpen, filtersActive, onOpenFilters } =
    useHomeCatalogSearch();

  return (
    <HomeCatalogSearchRow
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      filtersOpen={filtersOpen}
      filtersActive={filtersActive}
      onOpenFilters={onOpenFilters}
      embeddedInForegroundSheet
    />
  );
});

HomeCatalogEmbeddedSearchRow.displayName = "HomeCatalogEmbeddedSearchRow";
