import { useMemo } from "react";

import { useAppShellCatalogSections } from "./AppShellCatalogSectionsContext.jsx";
import { useAppShellStateContext } from "./AppShellStateContext.jsx";

export function useCatalogMainContentProps() {
  const { catalogGridSection, catalogBrowserSection } = useAppShellCatalogSections();
  const { catalogMainView } = useAppShellStateContext();

  return useMemo(
    () => ({
      catalogMainView: catalogMainView ?? "catalog",
      catalogGridSection,
      catalogBrowserSection,
    }),
    [catalogBrowserSection, catalogGridSection, catalogMainView],
  );
}
