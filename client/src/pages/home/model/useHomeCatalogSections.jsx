import { useMemo } from "react";

import {
  HomePageCatalogGridSection,
  HomePageCatalogSection,
} from "../ui/HomePageCatalogSection.jsx";

/**
 * @param {object} params
 */
export const useHomeCatalogSections = ({
  catalogGridSectionProps,
  isCatalogBrowserLanding,
  categoryDisplays,
  isAdmin,
  categoryDisplaysStatus,
  handleCatalogFeedTileClick,
  handleCatalogCategoryGridClick,
  setEditingCategorySlug,
  selectedCategoryLabel,
  activeCatalogFeedLabel,
  handleBackToCatalogLanding,
}) => {
  const catalogGridSection = useMemo(
    () => <HomePageCatalogGridSection {...catalogGridSectionProps} />,
    [catalogGridSectionProps],
  );

  const catalogBrowserSection = useMemo(
    () => (
      <HomePageCatalogSection
        isCatalogBrowserLanding={isCatalogBrowserLanding}
        categoryDisplays={categoryDisplays}
        isAdmin={isAdmin}
        categoryDisplaysStatus={categoryDisplaysStatus}
        onFeedTileClick={handleCatalogFeedTileClick}
        onCategoryClick={handleCatalogCategoryGridClick}
        onEditCategoryClick={setEditingCategorySlug}
        selectedCategoryLabel={selectedCategoryLabel}
        activeCatalogFeedLabel={activeCatalogFeedLabel}
        onBackToCatalogLanding={handleBackToCatalogLanding}
        catalogGridSectionProps={catalogGridSectionProps}
      />
    ),
    [
      isCatalogBrowserLanding,
      categoryDisplays,
      isAdmin,
      categoryDisplaysStatus,
      handleCatalogFeedTileClick,
      handleCatalogCategoryGridClick,
      setEditingCategorySlug,
      selectedCategoryLabel,
      activeCatalogFeedLabel,
      handleBackToCatalogLanding,
      catalogGridSectionProps,
    ],
  );

  return { catalogGridSection, catalogBrowserSection };
};
