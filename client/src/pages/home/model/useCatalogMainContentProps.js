import { useMemo } from "react";

import { useAppShellCatalogSections } from "../../../app/model/AppShellCatalogSectionsContext.jsx";
import { useAppShellStateContext } from "../../../app/model/AppShellStateContext.jsx";

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
