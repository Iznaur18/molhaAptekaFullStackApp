import { useMemo } from "react";

import { pathnameToCatalogMainView } from "../../../shared/lib/catalogMainViewPaths.js";

/**
 * @param {import('react-router-dom').Location} location
 */
export function useCatalogMainView(location) {
  const catalogMainView = useMemo(
    () => pathnameToCatalogMainView(location.pathname),
    [location.pathname],
  );

  const isCatalogRoute = catalogMainView != null;
  const isHomeCatalogMainView = catalogMainView === "catalog";
  const isCatalogBrowserMainViewActive = catalogMainView === "catalog-browser";

  return {
    catalogMainView,
    isCatalogRoute,
    isHomeCatalogMainView,
    isCatalogBrowserMainViewActive,
  };
}
