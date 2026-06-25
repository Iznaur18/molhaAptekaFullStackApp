import { useMemo } from "react";

import { CATALOG_SORT_CITY } from "@/entities/product-category-display/lib/catalogFeedTiles";

type UseHomeCatalogCityFilterParams = {
  isAuthorized: boolean;
  catalogAllCities: boolean;
  sort?: string;
  userAddressCity?: string | null;
};

export const useHomeCatalogCityFilter = ({
  isAuthorized,
  catalogAllCities,
  sort,
  userAddressCity,
}: UseHomeCatalogCityFilterParams) => {
  const cityLabel = useMemo(
    () => String(userAddressCity ?? "").trim(),
    [userAddressCity],
  );

  const showBanner =
    isAuthorized &&
    cityLabel !== "" &&
    !catalogAllCities &&
    sort !== CATALOG_SORT_CITY;

  return { cityLabel, showBanner };
};
