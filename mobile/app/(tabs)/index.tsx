import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import {
  ActivityIndicator,
  Text,
  useWindowDimensions,
  View,
  type FlatList,
  type ViewStyle,
} from "react-native";
import type Animated from "react-native-reanimated";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

import type { CatalogListFilters, CatalogSort } from "@/entities/product/model/catalogListFilters";
import { useCatalogProductsInfiniteQuery } from "@/entities/product/model/useCatalogProductsInfiniteQuery";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { resolveCatalogGridListContentStyle } from "@/features/catalog-grid/lib/catalogGridLayout";
import { shouldShowCatalogTier3Banners } from "@/features/catalog-grid/lib/shouldShowCatalogTier3Banners";
import { CatalogGridRowItem } from "@/features/catalog-grid/ui/CatalogGridRowItem";
import { CatalogGridSkeleton } from "@/features/catalog-grid/ui/CatalogGridSkeleton";
import { CatalogAnimatedFlatList } from "@/features/catalog-grid/ui/CatalogAnimatedFlatList";
import { CatalogScrollAnimationProvider } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";
import { useCatalogBreadcrumbLabel } from "@/features/catalog-filter/model/useCatalogBreadcrumbLabel";
import { CatalogBreadcrumb } from "@/features/catalog-filter/ui/CatalogBreadcrumb";
import { consumePendingCatalogFilters } from "@/features/catalog-browser/model/pendingCatalogFilters";
import { isHomeCuratedProductListsVisible } from "@/entities/curated-product-list/lib/isHomeCuratedProductListsVisible";
import { isHomeCatalogMainView } from "@/features/home-feed/lib/isHomeCatalogMainView";
import {
  buildHomeCatalogFeedListRows,
  HOME_CATALOG_FEED_STICKY_SEARCH_INDEX,
  HOME_CATALOG_FEED_META_ROW_COUNT,
  type HomeCatalogFeedListRow,
} from "@/features/home-feed/lib/buildHomeCatalogFeedListRows";
import { invalidateHomeFeedQueries } from "@/features/home-feed/model/invalidateHomeFeedQueries";
import { useHomeFeedContentReady } from "@/features/home-feed/model/useHomeFeedContentReady";
import {
  EMPTY_HOME_CATALOG_FEED_FILTERS,
  type HomeCatalogFeedFiltersState,
} from "@/features/home-feed/model/homeCatalogFeedFilters";
import { HomeFeedHeader } from "@/features/home-feed/ui/HomeFeedHeader";
import { HomeCatalogFeedSheetCap } from "@/features/home-feed/ui/HomeCatalogFeedSheetCap";
import { HomeCatalogPrimaryBackdrop } from "@/features/home-feed/ui/HomeCatalogPrimaryBackdrop";
import { HomeCatalogSearchRow } from "@/features/home-feed/ui/HomeCatalogSearchRow";
import { HomeCatalogSiteHeaderBannerRow } from "@/features/home-feed/ui/HomeCatalogSiteHeaderBannerRow";
import { HomeCatalogStickySearchShell } from "@/features/home-feed/ui/HomeCatalogStickySearchShell";
import {
  API_CLIENT_UI,
  CATALOG_SEARCH_DEBOUNCE_MS,
  CATALOG_SEARCH_MIN_LENGTH,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useColdStartSplashGate } from "@/shared/model/coldStartSplashGate";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useFeedScreenStyles } from "@/shared/theme/catalogProductStyles";
import { HOME_PAGE_UI } from "@/shared/config/homePageUi";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

type FeedFiltersState = HomeCatalogFeedFiltersState;

const EMPTY_FEED_FILTERS = EMPTY_HOME_CATALOG_FEED_FILTERS;

export default function CatalogScreen() {
  const styles = useFeedScreenStyles();
  const queryClient = useQueryClient();
  const productGrid = useProductGridLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { height: windowHeight } = useWindowDimensions();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRootSlug, setSelectedRootSlug] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedSellerPersonalCategoryId, setSelectedSellerPersonalCategoryId] = useState<
    string | null
  >(null);
  const [feedFilters, setFeedFilters] = useState<FeedFiltersState>(EMPTY_FEED_FILTERS);
  // Пересечение типов: рантайм-реф Reanimated отдаёт внутренний FlatList
  // (нужен useScrollToTop), а проп ref анимированного списка требует
  // Animated.FlatList.
  const catalogListRef = useRef<
    FlatList<HomeCatalogFeedListRow | CatalogGridRow> &
      Animated.FlatList<HomeCatalogFeedListRow | CatalogGridRow>
  >(null);

  useScrollToTop(catalogListRef);

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
    [
      debouncedSearch,
      feedFilters,
      selectedRootSlug,
      selectedSubcategoryId,
      selectedSellerPersonalCategoryId,
    ],
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

  const catalogBreadcrumbLabel = useCatalogBreadcrumbLabel({
    enabled: !showHomeFeed,
    search: debouncedSearch,
    selectedRootSlug,
    selectedSubcategoryId,
    selectedSellerPersonalCategoryId,
    feedFilters,
  });

  const showFullWidthTier3Banners = shouldShowCatalogTier3Banners({ showHomeFeed });

  const showCuratedProductLists = useMemo(
    () =>
      isHomeCuratedProductListsVisible({
        isHomeCatalogMainView: showHomeFeed,
        selectedProductCategory: selectedRootSlug,
        selectedCategoryId: selectedSubcategoryId,
        hasProductSearchQuery: Boolean(debouncedSearch),
        catalogFollowingOnly: feedFilters.followingOnly === true,
        catalogAuctionOnly: feedFilters.auctionOnly === true,
        catalogInstallmentOnly: feedFilters.installmentOnly === true,
        catalogSaleOnly: feedFilters.saleOnly === true,
      }),
    [debouncedSearch, feedFilters, selectedRootSlug, selectedSubcategoryId, showHomeFeed],
  );

  const homeFeedContentReady = useHomeFeedContentReady({
    enabled: showHomeFeed,
    includeCuratedLists: showCuratedProductLists,
  });

  // Холодный старт: держим нативный сплэш, пока каталог и все секции главной
  // не готовы — экран появляется одним кадром, без поддёргиваний от
  // догружающихся блоков. После первого показа гейт — no-op.
  useColdStartSplashGate(homeFeedContentReady && !catalogQuery.isLoading);

  const catalogGridRows = useMemo(
    () =>
      buildCatalogGridRows(catalogQuery.products, productGrid.columns, {
        showFullWidthTier3Banners,
      }),
    [catalogQuery.products, productGrid.columns, showFullWidthTier3Banners],
  );

  const homeFeedListRows = useMemo(
    () => buildHomeCatalogFeedListRows(catalogGridRows),
    [catalogGridRows],
  );

  const handleRefresh = useCallback(async () => {
    try {
      const tasks: Promise<unknown>[] = [catalogQuery.refetch()];
      if (showHomeFeed) {
        tasks.push(invalidateHomeFeedQueries(queryClient));
      }
      await Promise.all(tasks);
    } catch {
      // individual queries surface errors via query state
    }
  }, [catalogQuery, queryClient, showHomeFeed]);

  const isRefreshing = catalogQuery.isRefetching;

  const handleLoadMore = () => {
    if (catalogQuery.hasNextPage && !catalogQuery.isFetchingNextPage) {
      catalogQuery.fetchNextPage();
    }
  };

  const searchRow = (
    <HomeCatalogSearchRow
      value={searchInput}
      onChange={setSearchInput}
      embeddedInForegroundSheet={showHomeFeed}
    />
  );

  const listHeader = (
    <View style={styles.listHeader}>
      {showHomeFeed ? <HomeCatalogSiteHeaderBannerRow visible={showHomeFeed} /> : null}
      {!showHomeFeed ? <CatalogBreadcrumb label={catalogBreadcrumbLabel} /> : null}
      {showHomeFeed ? (
        <HomeFeedHeader
          enabled={showHomeFeed}
          showCuratedLists={showCuratedProductLists}
        />
      ) : null}
      {showHomeFeed ? (
        <CatalogBreadcrumb label={HOME_PAGE_UI.BREADCRUMB_HOME} compactTop />
      ) : null}
    </View>
  );

  const homeFeedListFooter = (
    <View style={[styles.homeFeedSheetFiller, styles.homeFeedForeground]} />
  );

  const homeFeedContentContainerStyle = useMemo(
    (): ViewStyle[] => [
      styles.homeFeedListContent,
      {
        paddingBottom: contentPaddingBottom,
        minHeight: windowHeight,
        flexGrow: 1,
      },
    ],
    [contentPaddingBottom, styles.homeFeedListContent, windowHeight],
  );

  const renderHomeFeedRow = useCallback(
    ({ item, index }: { item: HomeCatalogFeedListRow; index: number }) => {
      if (!item) {
        return null;
      }

      if (item.kind === "hero") {
        return <HomeCatalogPrimaryBackdrop />;
      }

      if (item.kind === "cap") {
        return <HomeCatalogFeedSheetCap />;
      }

      if (item.kind === "search") {
        return (
          <HomeCatalogStickySearchShell>
            <HomeCatalogSearchRow
              value={searchInput}
              onChange={setSearchInput}
              embeddedInForegroundSheet
            />
          </HomeCatalogStickySearchShell>
        );
      }

      if (item.kind === "feed-header") {
        return (
          <View style={[styles.homeFeedRowSurface, styles.homeFeedInsetContent, styles.homeFeedForeground]}>
            {listHeader}
            {catalogGridRows.length === 0 ? (
              <View style={styles.centered}>
                <Text style={styles.empty}>{API_CLIENT_UI.CATALOG_EMPTY}</Text>
              </View>
            ) : null}
          </View>
        );
      }

      if (item.kind !== "product" || !item.row) {
        return null;
      }

      const productRowIndex = index - HOME_CATALOG_FEED_META_ROW_COUNT;

      return (
        <View
          style={[
            styles.homeFeedRowSurface,
            styles.homeFeedInsetContent,
            styles.homeFeedForeground,
            { paddingBottom: productGrid.gap },
          ]}
        >
          <CatalogGridRowItem
            row={item.row}
            columns={productGrid.columns}
            gap={productGrid.gap}
            tileWidth={productGrid.tileWidth}
            rowIndex={productRowIndex}
          />
        </View>
      );
    },
    [
      catalogGridRows.length,
      listHeader,
      productGrid.columns,
      productGrid.gap,
      productGrid.tileWidth,
      searchInput,
      styles.homeFeedInsetContent,
      styles.homeFeedForeground,
      styles.homeFeedRowSurface,
    ],
  );

  const catalogContentContainerStyle = useMemo(
    (): ViewStyle[] => [
      styles.listContent,
      resolveCatalogGridListContentStyle(productGrid.gap),
      { paddingBottom: contentPaddingBottom },
    ],
    [contentPaddingBottom, productGrid.gap, styles.listContent],
  );

  const renderHomeFeedScene = (content: ReactNode) => (
    <View style={[styles.flex, styles.homeFeedScene]}>{content}</View>
  );

  if (catalogQuery.isPending) {
    // Та же геометрия, что у загруженного списка (паддинги, gap), плюс
    // скелетон-плитки вместо спиннера — приход данных не сдвигает вёрстку.
    if (showHomeFeed) {
      return renderHomeFeedScene(
        <View style={styles.homeFeedPendingRoot}>
          <HomeCatalogPrimaryBackdrop />
          <View style={[styles.homeFeedPendingSheet, styles.homeFeedForeground]}>
            <HomeCatalogFeedSheetCap />
            <HomeCatalogStickySearchShell>
              {searchRow}
            </HomeCatalogStickySearchShell>
            <View style={styles.homeFeedInsetContent}>
              {listHeader}
              <CatalogGridSkeleton
                columns={productGrid.columns}
                tileWidth={productGrid.tileWidth}
                gap={productGrid.gap}
              />
            </View>
          </View>
        </View>,
      );
    }

    return (
      <View style={[styles.flex, centeredContentStyle]}>
        {searchRow}
        <View
          style={[
            styles.listContent,
            resolveCatalogGridListContentStyle(productGrid.gap),
            { paddingBottom: contentPaddingBottom },
          ]}
        >
          {listHeader}
          <CatalogGridSkeleton
            columns={productGrid.columns}
            tileWidth={productGrid.tileWidth}
            gap={productGrid.gap}
          />
        </View>
      </View>
    );
  }

  if (catalogQuery.isError) {
    if (showHomeFeed) {
      return renderHomeFeedScene(
        <View style={styles.homeFeedPendingRoot}>
          <HomeCatalogPrimaryBackdrop />
          <View style={[styles.homeFeedPendingSheet, styles.homeFeedForeground]}>
            <HomeCatalogFeedSheetCap />
            <HomeCatalogStickySearchShell>
              {searchRow}
            </HomeCatalogStickySearchShell>
            <View style={styles.homeFeedInsetContent}>
              {listHeader}
              <ScreenErrorState
                message={formatApiErrorMessage(catalogQuery.error, API_CLIENT_UI.CATALOG_ERROR)}
                onRetry={() => catalogQuery.refetch()}
              />
            </View>
          </View>
        </View>,
      );
    }

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

  if (showHomeFeed) {
    return (
      <CatalogScrollAnimationProvider>
        {renderHomeFeedScene(
          <CatalogAnimatedFlatList<HomeCatalogFeedListRow>
            ref={catalogListRef as Ref<Animated.FlatList<HomeCatalogFeedListRow>>}
            key={`${productGrid.listKey}-home-feed`}
            data={homeFeedListRows}
            keyExtractor={(item) => item.key}
            numColumns={1}
            stickyHeaderIndices={[HOME_CATALOG_FEED_STICKY_SEARCH_INDEX]}
            removeClippedSubviews={false}
            renderItem={renderHomeFeedRow}
            contentContainerStyle={homeFeedContentContainerStyle}
            style={[styles.flex, styles.homeFeedList]}
            refreshControl={
              <ThemedRefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              <View style={styles.homeFeedListFooterWrap}>
                {catalogQuery.isFetchingNextPage ? (
                  <View style={styles.homeFeedForeground}>
                    <ActivityIndicator style={styles.footerLoader} />
                  </View>
                ) : null}
                {homeFeedListFooter}
              </View>
            }
          />,
        )}
      </CatalogScrollAnimationProvider>
    );
  }

  return (
    <CatalogScrollAnimationProvider>
      <View style={[styles.flex, centeredContentStyle]}>
        {searchRow}
        <CatalogAnimatedFlatList<CatalogGridRow>
          ref={catalogListRef as Ref<Animated.FlatList<CatalogGridRow>>}
          key={productGrid.listKey}
          data={catalogGridRows}
          keyExtractor={(item) => item.key}
          numColumns={1}
          ListHeaderComponent={listHeader}
          renderItem={({ item, index }) => {
            if (!item) {
              return null;
            }

            return (
              <CatalogGridRowItem
                row={item}
                columns={productGrid.columns}
                gap={productGrid.gap}
                tileWidth={productGrid.tileWidth}
                rowIndex={index}
              />
            );
          }}
          contentContainerStyle={catalogContentContainerStyle}
          style={styles.flex}
          refreshControl={
            <ThemedRefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
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
    </CatalogScrollAnimationProvider>
  );
}
