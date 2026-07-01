import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { buildResolvedCatalogFeedTileDisplays } from "@/entities/product-category-display/lib/resolveCatalogFeedTileDisplay";
import {
  buildResolvedProductCategoryDisplaysFromRoots,
  PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE,
} from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { useProductCatalogFeedTileDisplaysQuery } from "@/entities/product-category-display/model/useProductCatalogFeedTileDisplaysQuery";
import { useProductCategoryDisplaysQuery } from "@/entities/product-category-display/model/useProductCategoryDisplaysQuery";
import { useProductCategoryRootsQuery } from "@/entities/product-category-tree/model/useProductCategoryRootsQuery";
import { useSellerPersonalCategoryCatalogTilesQuery } from "@/entities/seller-personal-category/model/useSellerPersonalCategoryCatalogTilesQuery";
import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";
import { buildQueryForCatalogFeedTile } from "@/features/catalog-browser/model/buildQueryForCatalogFeedTile";
import { setPendingCatalogFilters } from "@/features/catalog-browser/model/pendingCatalogFilters";
import { useCatalogBrowserGridLayout } from "@/features/catalog-browser/lib/useCatalogBrowserGridLayout";
import { CatalogBrowserTileCard } from "@/features/catalog-browser/ui/CatalogBrowserTileCard";
import { CatalogBrowserTilesGrid } from "@/features/catalog-browser/ui/CatalogBrowserTilesGrid";
import { EditCategoryDisplayModal } from "@/features/catalog-browser/ui/EditCategoryDisplayModal";
import { EditFeedTileDisplayModal } from "@/features/catalog-browser/ui/EditFeedTileDisplayModal";
import {
  CATALOG_BROWSER_UI,
  PRODUCT_CATEGORY_DISPLAY_UI,
  SELLER_PERSONAL_CATEGORY_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useCatalogBrowserPageStyles } from "@/shared/theme/catalogProductStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const CatalogBrowserPage = () => {
  const router = useRouter();
  const styles = useCatalogBrowserPageStyles();
  const gridLayout = useCatalogBrowserGridLayout();
  const tileLayoutProps = {
    tileWidth: gridLayout.tileWidth,
    columns: gridLayout.columns,
    gap: gridLayout.gap,
    contentWidth: gridLayout.contentWidth,
  };
  const { contentPaddingTop } = useScreenLayout();
  const { isAdmin, isAuthorized } = useUserAccess();

  const categoryDisplaysQuery = useProductCategoryDisplaysQuery();
  const feedTileDisplaysQuery = useProductCatalogFeedTileDisplaysQuery();
  const categoryRootsQuery = useProductCategoryRootsQuery();
  const personalCategoryTilesQuery = useSellerPersonalCategoryCatalogTilesQuery();

  const [editingCategorySlug, setEditingCategorySlug] = useState<string | null>(null);
  const [editingFeedTileKey, setEditingFeedTileKey] = useState<string | null>(null);

  const categoryDisplays = categoryDisplaysQuery.data ?? [];
  const feedTileDisplays = feedTileDisplaysQuery.data ?? [];
  const categoryRoots = categoryRootsQuery.data ?? [];
  const personalCategoryTiles = personalCategoryTilesQuery.data ?? [];

  const feedTiles = useMemo(
    () => buildResolvedCatalogFeedTileDisplays(feedTileDisplays),
    [feedTileDisplays],
  );

  const categoryItems = useMemo(
    () => buildResolvedProductCategoryDisplaysFromRoots(categoryRoots, categoryDisplays),
    [categoryDisplays, categoryRoots],
  );

  const isLoading =
    categoryDisplaysQuery.isPending ||
    feedTileDisplaysQuery.isPending ||
    categoryRootsQuery.isPending ||
    personalCategoryTilesQuery.isPending;

  const queryError =
    categoryDisplaysQuery.error ??
    feedTileDisplaysQuery.error ??
    categoryRootsQuery.error ??
    personalCategoryTilesQuery.error;

  const openCatalogWithFilters = (filters: Partial<CatalogListFilters>) => {
    setPendingCatalogFilters({
      view: "main",
      ...filters,
    });
    router.replace("/(tabs)");
  };

  const handleFeedTilePress = (tileKey: string) => {
    const item = feedTiles.find((row) => row.tileKey === tileKey);
    if (!item) {
      return;
    }

    const query = buildQueryForCatalogFeedTile(item.tile);
    if (query.followingOnly && !isAuthorized) {
      Alert.alert(CATALOG_BROWSER_UI.LOGIN_FOR_FOLLOWING, undefined, [
        { text: "Отмена", style: "cancel" },
        { text: "Войти", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    openCatalogWithFilters(query);
  };

  const handleCategoryPress = (categorySlug: string) => {
    openCatalogWithFilters({ productCategory: categorySlug });
  };

  const handlePersonalCategoryPress = (campaignId: string) => {
    openCatalogWithFilters({ sellerPersonalCategoryId: campaignId });
  };

  const handleRefreshDisplays = () => {
    void Promise.all([
      categoryDisplaysQuery.refetch(),
      feedTileDisplaysQuery.refetch(),
      categoryRootsQuery.refetch(),
      personalCategoryTilesQuery.refetch(),
    ]);
  };

  if (isLoading) {
    return <ScreenLoadingState message={CATALOG_BROWSER_UI.LOADING} />;
  }

  if (queryError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(queryError, CATALOG_BROWSER_UI.ERROR)}
        onRetry={handleRefreshDisplays}
      />
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: contentPaddingTop + 16 }]}>
        <CatalogBrowserTilesGrid
          title={PRODUCT_CATEGORY_DISPLAY_UI.FEED_SECTION_TITLE}
          accessibilityLabel={PRODUCT_CATEGORY_DISPLAY_UI.FEED_GRID_ARIA}
          gap={gridLayout.gap}
        >
          {feedTiles.map((item) => (
            <CatalogBrowserTileCard
              key={item.tileKey}
              label={item.label}
              imageUrl={item.imageUrl}
              placeholderImageUrl={PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE}
              {...tileLayoutProps}
              variant="feed"
              onPress={() => handleFeedTilePress(item.tileKey)}
              onEditPress={
                isAdmin ? () => setEditingFeedTileKey(item.tileKey) : undefined
              }
              editAriaLabel={PRODUCT_CATEGORY_DISPLAY_UI.FEED_EDIT_ARIA(item.label)}
            />
          ))}
        </CatalogBrowserTilesGrid>

        {personalCategoryTiles.length > 0 ? (
          <CatalogBrowserTilesGrid
            title={SELLER_PERSONAL_CATEGORY_PAGE_UI.TILES_SECTION_TITLE}
            gap={gridLayout.gap}
          >
            {personalCategoryTiles.map((tile) => (
              <CatalogBrowserTileCard
                key={tile._id}
                label={tile.labelRu}
                imageUrl={tile.imageUrl}
                placeholderImageUrl={PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE}
                {...tileLayoutProps}
                onPress={() => handlePersonalCategoryPress(tile._id)}
              />
            ))}
          </CatalogBrowserTilesGrid>
        ) : null}

        <CatalogBrowserTilesGrid
          title={PRODUCT_CATEGORY_DISPLAY_UI.CATEGORIES_SECTION_TITLE}
          accessibilityLabel={PRODUCT_CATEGORY_DISPLAY_UI.GRID_ARIA}
          gap={gridLayout.gap}
        >
          {categoryItems.map((item) => (
            <CatalogBrowserTileCard
              key={item.categorySlug}
              label={item.label}
              imageUrl={item.imageUrl}
              placeholderImageUrl={PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE}
              {...tileLayoutProps}
              onPress={() => handleCategoryPress(item.categorySlug)}
              onEditPress={
                isAdmin ? () => setEditingCategorySlug(item.categorySlug) : undefined
              }
              editAriaLabel={PRODUCT_CATEGORY_DISPLAY_UI.EDIT_ARIA(item.label)}
            />
          ))}
        </CatalogBrowserTilesGrid>
      </ScrollView>

      <EditCategoryDisplayModal
        visible={editingCategorySlug != null}
        categorySlug={editingCategorySlug}
        displays={categoryDisplays}
        categoryRoots={categoryRoots}
        onClose={() => setEditingCategorySlug(null)}
        onSaved={handleRefreshDisplays}
      />

      <EditFeedTileDisplayModal
        visible={editingFeedTileKey != null}
        tileKey={editingFeedTileKey}
        displays={feedTileDisplays}
        onClose={() => setEditingFeedTileKey(null)}
        onSaved={handleRefreshDisplays}
      />
    </>
  );
};
