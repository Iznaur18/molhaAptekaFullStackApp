import { memo } from "react";

import { useHomeCatalogSearch } from "@/features/home-feed/model/HomeCatalogSearchContext";
import { HomeCatalogSearchRow } from "@/features/home-feed/ui/HomeCatalogSearchRow";

export const HomeCatalogEmbeddedSearchRow = memo(() => {
  const { value, onChange } = useHomeCatalogSearch();

  return (
    <HomeCatalogSearchRow
      value={value}
      onChange={onChange}
      embeddedInForegroundSheet
    />
  );
});

HomeCatalogEmbeddedSearchRow.displayName = "HomeCatalogEmbeddedSearchRow";
