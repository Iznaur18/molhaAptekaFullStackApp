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
  feedTileDisplays,
  isAdmin,
  categoryDisplaysStatus,
  handleCatalogFeedTileClick,
  handleCatalogCategoryGridClick,
  handleCatalogCategoryTreeSelect,
  handleClearCatalogCategoryTreeFilter,
  activeCatalogBrowserCategoryId,
  selectedCategoryLabel,
  setEditingCategorySlug,
  setEditingFeedTileKey,
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
        feedTileDisplays={feedTileDisplays}
        isAdmin={isAdmin}
        categoryDisplaysStatus={categoryDisplaysStatus}
        onFeedTileClick={handleCatalogFeedTileClick}
        onCategoryClick={handleCatalogCategoryGridClick}
        onEditCategoryClick={setEditingCategorySlug}
        onEditFeedTileClick={setEditingFeedTileKey}
        activeCatalogBrowserCategoryId={activeCatalogBrowserCategoryId}
        selectedCategoryLabel={selectedCategoryLabel}
        onCatalogCategoryTreeSelect={handleCatalogCategoryTreeSelect}
        onClearCatalogCategoryTreeFilter={handleClearCatalogCategoryTreeFilter}
        activeCatalogFeedLabel={activeCatalogFeedLabel}
        onBackToCatalogLanding={handleBackToCatalogLanding}
        catalogGridSectionProps={catalogGridSectionProps}
      />
    ),
    [
      isCatalogBrowserLanding,
      categoryDisplays,
      feedTileDisplays,
      isAdmin,
      categoryDisplaysStatus,
      handleCatalogFeedTileClick,
      handleCatalogCategoryGridClick,
      handleCatalogCategoryTreeSelect,
      handleClearCatalogCategoryTreeFilter,
      activeCatalogBrowserCategoryId,
      selectedCategoryLabel,
      setEditingCategorySlug,
      setEditingFeedTileKey,
      activeCatalogFeedLabel,
      handleBackToCatalogLanding,
      catalogGridSectionProps,
    ],
  );

  return { catalogGridSection, catalogBrowserSection };
};
