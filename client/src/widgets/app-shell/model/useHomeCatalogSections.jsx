import { useMemo } from "react";

import {
  AppShellCatalogGridSection,
  AppShellCatalogSection,
} from "../ui/AppShellCatalogSection.jsx";
import { useHomeCatalogGridProps } from "./useHomeCatalogGridProps.js";
import { useAppShellStateContext } from "./AppShellStateContext.jsx";

export const useHomeCatalogSections = () => {
  const ctx = useAppShellStateContext();
  const {
    isCatalogBrowserLanding,
    categoryRoots,
    categoryDisplays,
    feedTileDisplays,
    isAdmin,
    categoryDisplaysStatus,
    handleCatalogFeedTileClick,
    handleCatalogCategoryGridClick,
    handleSellerPersonalCategoryTileClick,
    personalCategoryTiles,
    setEditingCategorySlug,
    setEditingFeedTileKey,
    selectedCategoryLabel,
    activeCatalogFeedLabel,
    handleBackToCatalogLanding,
    isCatalogSubcategoryPickerActive,
    subcategoryPickerTrail,
    subcategoryPickerLoadError,
    resolvingLandingCategoryKey,
    resolvingPickerCategoryId,
    handleSubcategoryPickerBack,
    handleSubcategoryPickerViewAll,
    handleSubcategoryPickerCategoryClick,
    setEditingCategoryNode,
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
        isCatalogSubcategoryPickerActive={isCatalogSubcategoryPickerActive}
        subcategoryPickerTrail={subcategoryPickerTrail}
        subcategoryPickerLoadError={subcategoryPickerLoadError}
        resolvingLandingCategoryKey={resolvingLandingCategoryKey}
        resolvingPickerCategoryId={resolvingPickerCategoryId}
        onSubcategoryPickerBack={handleSubcategoryPickerBack}
        onSubcategoryPickerViewAll={handleSubcategoryPickerViewAll}
        onSubcategoryPickerCategoryClick={handleSubcategoryPickerCategoryClick}
        onEditCategoryNodeClick={setEditingCategoryNode}
        categoryRoots={categoryRoots}
        categoryDisplays={categoryDisplays}
        feedTileDisplays={feedTileDisplays}
        isAdmin={isAdmin}
        categoryDisplaysStatus={categoryDisplaysStatus}
        onFeedTileClick={handleCatalogFeedTileClick}
        onCategoryClick={handleCatalogCategoryGridClick}
        personalCategoryTiles={personalCategoryTiles}
        onPersonalCategoryClick={handleSellerPersonalCategoryTileClick}
        onEditCategoryClick={setEditingCategorySlug}
        onEditFeedTileClick={setEditingFeedTileKey}
        selectedCategoryLabel={selectedCategoryLabel}
        activeCatalogFeedLabel={activeCatalogFeedLabel}
        onBackToCatalogLanding={handleBackToCatalogLanding}
        catalogGridSectionProps={catalogGridSectionProps}
      />
    ),
    [
      isCatalogBrowserLanding,
      isCatalogSubcategoryPickerActive,
      subcategoryPickerTrail,
      subcategoryPickerLoadError,
      resolvingLandingCategoryKey,
      resolvingPickerCategoryId,
      handleSubcategoryPickerBack,
      handleSubcategoryPickerViewAll,
      handleSubcategoryPickerCategoryClick,
      setEditingCategoryNode,
      categoryRoots,
    categoryDisplays,
      feedTileDisplays,
      isAdmin,
      categoryDisplaysStatus,
      handleCatalogFeedTileClick,
      handleCatalogCategoryGridClick,
      handleSellerPersonalCategoryTileClick,
      personalCategoryTiles,
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
