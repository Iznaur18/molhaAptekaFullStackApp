import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";
import { useFocusEffect } from "@react-navigation/native";

import { buildCategoryFilterChips } from "@/entities/product-category-display/lib/buildCategoryFilterChips";
import { useProductCategoryDisplaysQuery } from "@/entities/product-category-display/model/useProductCategoryDisplaysQuery";
import { useProductCategoryChildrenQuery } from "@/entities/product-category-tree/model/useProductCategoryChildrenQuery";
import type { CatalogListFilters, CatalogSort } from "@/entities/product/model/catalogListFilters";
import { useCatalogProductsInfiniteQuery } from "@/entities/product/model/useCatalogProductsInfiniteQuery";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { resolveCatalogGridListContentStyle } from "@/features/catalog-grid/lib/catalogGridLayout";
import { shouldShowCatalogTier3Banners } from "@/features/catalog-grid/lib/shouldShowCatalogTier3Banners";
import { CatalogGridRowItem } from "@/features/catalog-grid/ui/CatalogGridRowItem";
import { CatalogCategoryChips } from "@/features/catalog-filter/ui/CatalogCategoryChips";
import { CatalogSubcategoryChips } from "@/features/catalog-filter/ui/CatalogSubcategoryChips";
import { consumePendingCatalogFilters } from "@/features/catalog-browser/model/pendingCatalogFilters";
import { HomeCatalogSearchRow } from "@/features/home-feed/ui/HomeCatalogSearchRow";
import { HomeFeedHeader } from "@/features/home-feed/ui/HomeFeedHeader";
import { isHomeCatalogMainView } from "@/features/home-feed/lib/isHomeCatalogMainView";
import {
  EMPTY_HOME_CATALOG_FEED_FILTERS,
  type HomeCatalogFeedFiltersState,
} from "@/features/home-feed/model/homeCatalogFeedFilters";
import { useResetHomeCatalogFilters } from "@/features/home-feed/model/useResetHomeCatalogFilters";
import {
  API_CLIENT_UI,
  CATALOG_SEARCH_DEBOUNCE_MS,
  CATALOG_SEARCH_MIN_LENGTH,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useFeedScreenStyles } from "@/shared/theme/catalogProductStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

type FeedFiltersState = HomeCatalogFeedFiltersState;

const EMPTY_FEED_FILTERS = EMPTY_HOME_CATALOG_FEED_FILTERS;

export default function CatalogScreen() {
  const styles = useFeedScreenStyles();
  const productGrid = useProductGridLayout();
  const { centeredContentStyle } = useScreenLayout();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRootSlug, setSelectedRootSlug] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedSellerPersonalCategoryId, setSelectedSellerPersonalCategoryId] = useState<
    string | null
  >(null);
  const [feedFilters, setFeedFilters] = useState<FeedFiltersState>(EMPTY_FEED_FILTERS);

  const categoryDisplaysQuery = useProductCategoryDisplaysQuery();
  const categoryChips = useMemo(
    () => buildCategoryFilterChips(categoryDisplaysQuery.data ?? []),
    [categoryDisplaysQuery.data],
  );

  const selectedRootChip = useMemo(
    () => categoryChips.find((chip) => chip.slug === selectedRootSlug) ?? null,
    [categoryChips, selectedRootSlug],
  );

  const childrenQuery = useProductCategoryChildrenQuery(selectedRootChip?.categoryId ?? null);

  const subcategoryChips = useMemo(() => {
    const categories = childrenQuery.data?.categories ?? [];
    return categories.map((node) => ({
      id: String(node._id),
      label: String(node.name ?? node._id),
    }));
  }, [childrenQuery.data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      setDebouncedSearch(
        trimmed.length >= CATALOG_SEARCH_MIN_LENGTH || trimmed.length === 0 ? trimmed : "",
      );
    }, CATALOG_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingCatalogFilters();
      if (!pending) {
        return;
      }

      const nextSearch = pending.search ?? "";
      setSearchInput(nextSearch);
      setDebouncedSearch(nextSearch);
      setSelectedRootSlug(pending.productCategory ?? null);
      setSelectedSubcategoryId(pending.categoryId ?? null);
      setSelectedSellerPersonalCategoryId(pending.sellerPersonalCategoryId ?? null);
      setFeedFilters({
        sort: pending.sort,
        followingOnly: pending.followingOnly === true,
        auctionOnly: pending.auctionOnly === true,
        installmentOnly: pending.installmentOnly === true,
        saleOnly: pending.saleOnly === true,
      });
    }, []),
  );

  const handleRootCategorySelect = (slug: string | null) => {
    setSelectedRootSlug(slug);
    setSelectedSubcategoryId(null);
    setSelectedSellerPersonalCategoryId(null);
    setFeedFilters(EMPTY_FEED_FILTERS);
  };

  const catalogFilters = useMemo(
    (): CatalogListFilters => ({
      view: "main",
      search: debouncedSearch || undefined,
      productCategory:
        selectedRootSlug && !selectedSubcategoryId ? selectedRootSlug : undefined,
      categoryId: selectedSubcategoryId ?? undefined,
      sellerPersonalCategoryId: selectedSellerPersonalCategoryId ?? undefined,
      sort: feedFilters.sort as CatalogSort | undefined,
      followingOnly: feedFilters.followingOnly || undefined,
      auctionOnly: feedFilters.auctionOnly || undefined,
      installmentOnly: feedFilters.installmentOnly || undefined,
      saleOnly: feedFilters.saleOnly || undefined,
    }),
    [debouncedSearch, feedFilters, selectedRootSlug, selectedSubcategoryId, selectedSellerPersonalCategoryId],
  );

  const catalogQuery = useCatalogProductsInfiniteQuery(catalogFilters);

  const showHomeFeed = useMemo(
    () =>
      isHomeCatalogMainView({
        search: debouncedSearch,
        selectedRootSlug,
        selectedSubcategoryId,
        sellerPersonalCategoryId: selectedSellerPersonalCategoryId,
        sort: feedFilters.sort,
        followingOnly: feedFilters.followingOnly === true,
        auctionOnly: feedFilters.auctionOnly === true,
        installmentOnly: feedFilters.installmentOnly === true,
        saleOnly: feedFilters.saleOnly === true,
      }),
    [debouncedSearch, feedFilters, selectedRootSlug, selectedSubcategoryId, selectedSellerPersonalCategoryId],
  );

  const showFullWidthTier3Banners = shouldShowCatalogTier3Banners({ showHomeFeed });

  const catalogGridRows = useMemo(
    () =>
      buildCatalogGridRows(catalogQuery.products, productGrid.columns, {
        showFullWidthTier3Banners,
      }),
    [catalogQuery.products, productGrid.columns, showFullWidthTier3Banners],
  );

  const handleRefresh = useCallback(() => {
    catalogQuery.refetch();
  }, [catalogQuery]);

  const handleLoadMore = () => {
    if (catalogQuery.hasNextPage && !catalogQuery.isFetchingNextPage) {
      catalogQuery.fetchNextPage();
    }
  };

  const handleResetHomeCatalog = useResetHomeCatalogFilters({
    setSearchInput,
    setDebouncedSearch,
    setSelectedRootSlug,
    setSelectedSubcategoryId,
    setSelectedSellerPersonalCategoryId,
    setFeedFilters,
    emptyFeedFilters: EMPTY_FEED_FILTERS,
  });

  const searchRow = (
    <HomeCatalogSearchRow
      value={searchInput}
      onChange={setSearchInput}
      onBrandPress={handleResetHomeCatalog}
    />
  );

  const listHeader = (
    <View>
      {!showHomeFeed ? (
        <>
          <CatalogCategoryChips
            chips={categoryChips}
            selectedSlug={selectedRootSlug}
            onSelect={handleRootCategorySelect}
          />
          <CatalogSubcategoryChips
            subcategories={subcategoryChips}
            selectedSubcategoryId={selectedSubcategoryId}
            onSelect={setSelectedSubcategoryId}
          />
        </>
      ) : null}
      {showHomeFeed ? <HomeFeedHeader enabled={showHomeFeed} /> : null}
    </View>
  );

  if (catalogQuery.isPending) {
    return (
      <View style={styles.flex}>
        {searchRow}
        {listHeader}
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (catalogQuery.isError) {
    return (
      <View style={styles.flex}>
        {searchRow}
        {listHeader}
        <ScreenErrorState
          message={formatApiErrorMessage(catalogQuery.error, API_CLIENT_UI.CATALOG_ERROR)}
          onRetry={() => catalogQuery.refetch()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.flex, centeredContentStyle]}>
      {searchRow}
      <FlatList
        key={productGrid.listKey}
        data={catalogGridRows}
        keyExtractor={(item) => item.key}
        numColumns={1}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <CatalogGridRowItem
            row={item}
            columns={productGrid.columns}
            gap={productGrid.gap}
            tileWidth={productGrid.tileWidth}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          resolveCatalogGridListContentStyle(productGrid.gap),
        ]}
        style={styles.flex}
        refreshControl={
          <ThemedRefreshControl refreshing={catalogQuery.isRefetching} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.empty}>{API_CLIENT_UI.CATALOG_EMPTY}</Text>
          </View>
        }
        ListFooterComponent={
          catalogQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
      />
    </View>
  );
}
