import { useMemo } from "react";

/**
 * @param {{
 *   catalogMainView: import('../../../shared/lib/catalogMainViewPaths.js').CatalogMainView | null;
 *   catalogGridSection: import('react').ReactNode;
 *   catalogBrowserSection: import('react').ReactNode;
 * }} params
 */
export function useCatalogMainContentProps({
  catalogMainView,
  catalogGridSection,
  catalogBrowserSection,
}) {
  return useMemo(
    () => ({
      catalogMainView: catalogMainView ?? "catalog",
      catalogGridSection,
      catalogBrowserSection,
    }),
    [catalogBrowserSection, catalogGridSection, catalogMainView],
  );
}
