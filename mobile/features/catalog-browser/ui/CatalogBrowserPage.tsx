import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { buildResolvedCatalogFeedTileDisplays } from "@/entities/product-category-display/lib/resolveCatalogFeedTileDisplay";
import { buildResolvedProductCategoryDisplaysFromRoots } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { useProductCatalogFeedTileDisplaysQuery } from "@/entities/product-category-display/model/useProductCatalogFeedTileDisplaysQuery";
import { useProductCategoryDisplaysQuery } from "@/entities/product-category-display/model/useProductCategoryDisplaysQuery";
import { useProductCategoryRootsQuery } from "@/entities/product-category-tree/model/useProductCategoryRootsQuery";
import { useSellerPersonalCategoryCatalogTilesQuery } from "@/entities/seller-personal-category/model/useSellerPersonalCategoryCatalogTilesQuery";
import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";
import { buildQueryForCatalogFeedTile } from "@/features/catalog-browser/model/buildQueryForCatalogFeedTile";
import { setPendingCatalogFilters } from "@/features/catalog-browser/model/pendingCatalogFilters";
import { CatalogBrowserTileCard } from "@/features/catalog-browser/ui/CatalogBrowserTileCard";
import { EditCategoryDisplayModal } from "@/features/catalog-browser/ui/EditCategoryDisplayModal";
import { EditFeedTileDisplayModal } from "@/features/catalog-browser/ui/EditFeedTileDisplayModal";
import {
  CATALOG_BROWSER_UI,
  PRODUCT_CATEGORY_DISPLAY_UI,
  SELLER_PERSONAL_CATEGORY_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const CatalogBrowserPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
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
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.colors.bg }]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>{CATALOG_BROWSER_UI.TITLE}</Text>

        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
          {PRODUCT_CATEGORY_DISPLAY_UI.FEED_SECTION_TITLE}
        </Text>
        <View style={styles.tilesGrid}>
          {feedTiles.map((item) => (
            <CatalogBrowserTileCard
              key={item.tileKey}
              label={item.label}
              imageUrl={item.imageUrl}
              onPress={() => handleFeedTilePress(item.tileKey)}
              onEditPress={
                isAdmin
                  ? () => setEditingFeedTileKey(item.tileKey)
                  : undefined
              }
              editAriaLabel={PRODUCT_CATEGORY_DISPLAY_UI.FEED_EDIT_ARIA(item.label)}
            />
          ))}
        </View>

        {personalCategoryTiles.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
              {SELLER_PERSONAL_CATEGORY_PAGE_UI.TILES_SECTION_TITLE}
            </Text>
            <View style={styles.tilesGrid}>
              {personalCategoryTiles.map((tile) => (
                <CatalogBrowserTileCard
                  key={tile._id}
                  label={tile.labelRu}
                  imageUrl={tile.imageUrl}
                  onPress={() => handlePersonalCategoryPress(tile._id)}
                />
              ))}
            </View>
          </>
        ) : null}

        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
          {PRODUCT_CATEGORY_DISPLAY_UI.CATEGORIES_SECTION_TITLE}
        </Text>
        <View style={styles.tilesGrid}>
          {categoryItems.map((item) => (
            <CatalogBrowserTileCard
              key={item.categorySlug}
              label={item.label}
              imageUrl={item.imageUrl}
              onPress={() => handleCategoryPress(item.categorySlug)}
              onEditPress={
                isAdmin ? () => setEditingCategorySlug(item.categorySlug) : undefined
              }
              editAriaLabel={PRODUCT_CATEGORY_DISPLAY_UI.EDIT_ARIA(item.label)}
            />
          ))}
        </View>
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

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tilesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
