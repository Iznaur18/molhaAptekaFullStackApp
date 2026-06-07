import { useMemo } from "react";

import {
  AppShellCatalogGridSection,
  AppShellCatalogSection,
} from "../ui/AppShellCatalogSection.jsx";
import { useHomeCatalogGridProps } from "./useHomeCatalogGridProps.js";
import { useAppShellCatalogSections } from "../../../app/model/AppShellCatalogSectionsContext.jsx";
import { useAppShellStateContext } from "../../../app/model/AppShellStateContext.jsx";

export const useHomeCatalogSections = () => {
  const ctx = useAppShellStateContext();
  const {
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
    setEditingCategorySlug,
    setEditingFeedTileKey,
    selectedCategoryLabel,
    activeCatalogFeedLabel,
    handleBackToCatalogLanding,
  } = ctx;

  const catalogGridSectionProps = useHomeCatalogGridProps();

  const catalogGridSection = useMemo(
    () => <AppShellCatalogGridSection {...catalogGridSectionProps} />,
    [catalogGridSectionProps],
  );

  const catalogBrowserSection = useMemo(
    () => (
      <AppShellCatalogSection
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
