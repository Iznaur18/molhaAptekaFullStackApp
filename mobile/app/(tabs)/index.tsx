import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type FlatList,
  type ViewStyle,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";
import { useRouter } from "expo-router";
import { useFocusEffect, useIsFocused, useNavigation, useScrollToTop } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { CatalogListFilters, CatalogSort } from "@/entities/product/model/catalogListFilters";
import { buildCatalogListScopeKey } from "@/entities/product/lib/shouldRetainCatalogListPlaceholderData";
import { useCatalogProductsInfiniteQuery } from "@/entities/product/model/useCatalogProductsInfiniteQuery";
import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import type { CatalogGridRow } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { catalogGridListPerformanceProps } from "@/features/catalog-grid/lib/catalogGridListPerformanceProps";
import { resolveCatalogGridListContentStyle } from "@/features/catalog-grid/lib/catalogGridLayout";
import { shouldShowCatalogTier3Banners } from "@/features/catalog-grid/lib/shouldShowCatalogTier3Banners";
import { CatalogGridRowItem } from "@/features/catalog-grid/ui/CatalogGridRowItem";
import { CatalogGridSkeleton } from "@/features/catalog-grid/ui/CatalogGridSkeleton";
import { CatalogAnimatedFlatList } from "@/features/catalog-grid/ui/CatalogAnimatedFlatList";
import { CatalogScrollAnimationProvider } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";
import { useCatalogBreadcrumbLabel } from "@/features/catalog-filter/model/useCatalogBreadcrumbLabel";
import { consumePendingCatalogFilters } from "@/features/catalog-browser/model/pendingCatalogFilters";
import type { HomeCuratedCategory } from "@/entities/curated-category-list/api/fetchHomeCuratedCategoryLists";
import { isHomeCuratedProductListsVisible } from "@/entities/curated-product-list/lib/isHomeCuratedProductListsVisible";
import { CATALOG_SORT_NEWEST } from "@/entities/product/model/productConstants";
import { isHomeCatalogMainView } from "@/features/home-feed/lib/isHomeCatalogMainView";
import {
  buildHomeCatalogFeedListRows,
  HOME_CATALOG_FEED_META_ROW_COUNT,
  type HomeCatalogFeedListRow,
} from "@/features/home-feed/lib/buildHomeCatalogFeedListRows";
import {
  homeCatalogFeedListPerformanceProps,
  homeCatalogFeedListScrollProps,
  resolveHomeCatalogFeedListStyle,
} from "@/features/home-feed/lib/homeCatalogFeedListScrollProps";
import { HomeCatalogSearchProvider } from "@/features/home-feed/model/HomeCatalogSearchContext";
import { IS_HOME_FEED_INTRO_BACKDROP_ENABLED } from "@/features/home-feed/model/isHomeFeedIntroBackdropEnabled";
import { useHomeFeedIntroTransition } from "@/features/home-feed/model/useHomeFeedIntroTransition";
import { invalidateHomeFeedQueries } from "@/features/home-feed/model/invalidateHomeFeedQueries";
import { useHomeFeedContentReady } from "@/features/home-feed/model/useHomeFeedContentReady";
import {
  EMPTY_HOME_CATALOG_FEED_FILTERS,
  type HomeCatalogFeedFiltersState,
} from "@/features/home-feed/model/homeCatalogFeedFilters";
import { HomeCatalogEmbeddedSearchRow } from "@/features/home-feed/ui/HomeCatalogEmbeddedSearchRow";
import { HomeFeedListHeader } from "@/features/home-feed/ui/HomeFeedListHeader";
import { HomeCatalogFeedSheetCap } from "@/features/home-feed/ui/HomeCatalogFeedSheetCap";
import { HomeCatalogPrimaryBackdrop } from "@/features/home-feed/ui/HomeCatalogPrimaryBackdrop";
import { HomeCatalogSearchRow } from "@/features/home-feed/ui/HomeCatalogSearchRow";
import { resolveCatalogEmptyReason } from "@/entities/product/lib/resolveCatalogEmptyReason";
import {
  API_CLIENT_UI,
  CATALOG_EMPTY_MESSAGE,
  CATALOG_LOAD_MORE_UI,
  CATALOG_SEARCH_MIN_LENGTH,
} from "@/shared/config";
import { CATALOG_SEARCH_QUERY_MAX_LENGTH } from "@molha/api-contract";
import { formatApiErrorMessage } from "@/shared/lib";
import { setCatalogCategoryView } from "@/shared/lib/catalogCategoryViewStore";
import {
  HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT,
  resolveHomeCatalogPrimaryBackdropHeight,
} from "@/shared/lib/homeCatalogBackdropLayout";
import { HOME_CATALOG_HEADER_STICKY_TOP_OFFSET } from "@/shared/lib/homeCatalogHeaderLayout";
import {
  resetHomeCatalogTabBarReveal,
  setHomeCatalogTabBarProgressDriven,
  setHomeCatalogTabBarScrollLinked,
  syncHomeCatalogTabBarRevealDistance,
} from "@/shared/model/homeCatalogTabBarVisibility";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useColdStartSplashGate } from "@/shared/model/coldStartSplashGate";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppActive, useTrimImageMemoryOnBackground } from "@/shared/model/useAppActive";
import {
  RowVisibilityBoundary,
  useVisibleRowsController,
  VisibleRowsProvider,
} from "@/shared/model/rowVisibility";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useFeedScreenStyles } from "@/shared/theme/catalogProductStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

type FeedFiltersState = HomeCatalogFeedFiltersState;

const EMPTY_FEED_FILTERS = EMPTY_HOME_CATALOG_FEED_FILTERS;

const resolveHomeFeedDockOffset = (windowHeight: number): number => {
  if (!IS_HOME_FEED_INTRO_BACKDROP_ENABLED) {
    return 0;
  }
  return (
    resolveHomeCatalogPrimaryBackdropHeight(windowHeight) + HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT
  );
};

export default function CatalogScreen() {
  const styles = useFeedScreenStyles();
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const productGrid = useProductGridLayout();
  const { centeredContentStyle, contentPaddingBottom, contentPaddingHorizontal } =
    useScreenLayout();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const appActive = useAppActive();
  // Уход в фон → чистим in-memory кеш картинок, освобождая RAM на слабых
  // устройствах (диск-кеш остаётся, сеть не дёргаем при возврате).
  useTrimImageMemoryOnBackground();
  // Один контроллер видимости строк на оба списка: onViewableItemsChanged кормит
  // стор видимыми ключами, а фокус экрана + активность приложения — общий гейт.
  // Тяжёлые видео в карточках вне вьюпорта, на другой вкладке или в фоне ставятся
  // на паузу — декодеры не греют CPU/GPU.
  const rowVisibility = useVisibleRowsController(isFocused && appActive);
  const { height: windowHeight } = useWindowDimensions();
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [selectedRootSlug, setSelectedRootSlug] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedSellerPersonalCategoryId, setSelectedSellerPersonalCategoryId] = useState<
    string | null
  >(null);
  const [feedFilters, setFeedFilters] = useState<FeedFiltersState>(EMPTY_FEED_FILTERS);
  const { viewerRegionCode } = useViewerRegion();
  // Пересечение типов: рантайм-реф Reanimated отдаёт внутренний FlatList
  // (нужен useScrollToTop), а проп ref анимированного списка требует
  // Animated.FlatList.
  const catalogListRef = useRef<
    FlatList<HomeCatalogFeedListRow | CatalogGridRow> &
      Animated.FlatList<HomeCatalogFeedListRow | CatalogGridRow>
  >(null);

  useScrollToTop(catalogListRef);

  // Дистанция сдвига шторки: интро (hero) сверху + cap-кромка. Именно на
  // столько «шторка» с товарами уезжает вниз в состоянии интро.
  const homeFeedDockOffset = useMemo(
    () => resolveHomeFeedDockOffset(windowHeight),
    [windowHeight],
  );

  // Набор текста сам по себе ничего не ищет: запрос уходит только по «Найти» на
  // клавиатуре. Пустое поле — не поиск, а отмена: каталог возвращается сразу.
  const handleSearchInputChange = useCallback((next: string) => {
    const capped = next.slice(0, CATALOG_SEARCH_QUERY_MAX_LENGTH);
    setSearchInput(capped);
    if (capped.trim() === "") {
      setSubmittedSearch("");
    }
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchInput.trim();
    setSubmittedSearch(trimmed.length >= CATALOG_SEARCH_MIN_LENGTH ? trimmed : "");
  }, [searchInput]);

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingCatalogFilters();
      if (!pending) {
        return;
      }

      const nextSearch = pending.search ?? "";
      setSearchInput(nextSearch);
      setSubmittedSearch(nextSearch);
      setSelectedRootSlug(pending.productCategory ?? null);
      setSelectedSubcategoryId(pending.categoryId ?? null);
      setSelectedSellerPersonalCategoryId(pending.sellerPersonalCategoryId ?? null);
      setFeedFilters({
        sort: pending.sort,
        followingOnly: pending.followingOnly === true,
        auctionOnly: pending.auctionOnly === true,
        installmentOnly: pending.installmentOnly === true,
        saleOnly: pending.saleOnly === true,
        rentalOnly: pending.rentalOnly === true,
        affiliateOnly: pending.affiliateOnly === true,
        wholesaleOnly: pending.wholesaleOnly === true,
        buyNFreeOnly: pending.buyNFreeOnly === true,
        originalOnly: pending.originalOnly === true,
        flashSaleOnly: pending.flashSaleOnly === true,
        near: pending.near === true,
      });
    }, []),
  );

  const catalogFilters = useMemo(
    (): CatalogListFilters => ({
      view: "main",
      search: submittedSearch || undefined,
      productCategory:
        selectedRootSlug && !selectedSubcategoryId ? selectedRootSlug : undefined,
      categoryId: selectedSubcategoryId ?? undefined,
      sellerPersonalCategoryId: selectedSellerPersonalCategoryId ?? undefined,
      sort: feedFilters.sort as CatalogSort | undefined,
      followingOnly: feedFilters.followingOnly || undefined,
      auctionOnly: feedFilters.auctionOnly || undefined,
      installmentOnly: feedFilters.installmentOnly || undefined,
      saleOnly: feedFilters.saleOnly || undefined,
      rentalOnly: feedFilters.rentalOnly || undefined,
      affiliateOnly: feedFilters.affiliateOnly || undefined,
      wholesaleOnly: feedFilters.wholesaleOnly || undefined,
      buyNFreeOnly: feedFilters.buyNFreeOnly || undefined,
      originalOnly: feedFilters.originalOnly || undefined,
      flashSaleOnly: feedFilters.flashSaleOnly || undefined,
      near: feedFilters.near || undefined,
      regionCode: viewerRegionCode || undefined,
    }),
    [
      submittedSearch,
      feedFilters,
      selectedRootSlug,
      selectedSubcategoryId,
      selectedSellerPersonalCategoryId,
      viewerRegionCode,
    ],
  );

  const catalogListScopeKey = useMemo(
    () => buildCatalogListScopeKey(catalogFilters),
    [catalogFilters],
  );

  useEffect(() => {
    catalogListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [catalogListScopeKey]);

  const catalogQuery = useCatalogProductsInfiniteQuery(catalogFilters);

  const showHomeFeed = useMemo(
    () =>
      isHomeCatalogMainView({
        search: submittedSearch,
        selectedRootSlug,
        selectedSubcategoryId,
        sellerPersonalCategoryId: selectedSellerPersonalCategoryId,
        sort: feedFilters.sort,
        followingOnly: feedFilters.followingOnly === true,
        auctionOnly: feedFilters.auctionOnly === true,
        installmentOnly: feedFilters.installmentOnly === true,
        saleOnly: feedFilters.saleOnly === true,
        rentalOnly: feedFilters.rentalOnly === true,
        affiliateOnly: feedFilters.affiliateOnly === true,
        wholesaleOnly: feedFilters.wholesaleOnly === true,
        buyNFreeOnly: feedFilters.buyNFreeOnly === true,
        originalOnly: feedFilters.originalOnly === true,
        flashSaleOnly: feedFilters.flashSaleOnly === true,
        near: feedFilters.near === true,
      }),
    [submittedSearch, feedFilters, selectedRootSlug, selectedSubcategoryId, selectedSellerPersonalCategoryId],
  );

  const introTransition = useHomeFeedIntroTransition({
    dockOffset: homeFeedDockOffset,
    listRef: catalogListRef,
    enabled: showHomeFeed,
    introBackdropEnabled: IS_HOME_FEED_INTRO_BACKDROP_ENABLED,
  });

  const catalogBreadcrumbLabel = useCatalogBreadcrumbLabel({
    enabled: !showHomeFeed,
    search: submittedSearch,
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
        hasProductSearchQuery: Boolean(submittedSearch),
        catalogFollowingOnly: feedFilters.followingOnly === true,
        catalogAuctionOnly: feedFilters.auctionOnly === true,
        catalogInstallmentOnly: feedFilters.installmentOnly === true,
        catalogSaleOnly: feedFilters.saleOnly === true,
        catalogRentalOnly: feedFilters.rentalOnly === true,
        catalogAffiliateOnly: feedFilters.affiliateOnly === true,
        catalogWholesaleOnly: feedFilters.wholesaleOnly === true,
        catalogBuyNFreeOnly: feedFilters.buyNFreeOnly === true,
        catalogOriginalOnly: feedFilters.originalOnly === true,
        catalogFlashSaleOnly: feedFilters.flashSaleOnly === true,
        catalogNear: feedFilters.near === true,
      }),
    [submittedSearch, feedFilters, selectedRootSlug, selectedSubcategoryId, showHomeFeed],
  );

  // Общее «Товаров пока нет» на включённый фильтр не объясняет, что виноват
  // фильтр, а не поломка — веб на каждый случай даёт свой текст.
  const catalogEmptyLabel =
    CATALOG_EMPTY_MESSAGE[
      resolveCatalogEmptyReason({
        hasQuery: Boolean(submittedSearch),
        hasSelectedCategory: Boolean(selectedRootSlug || selectedSubcategoryId),
        near: feedFilters.near === true,
        saleOnly: feedFilters.saleOnly === true,
        rentalOnly: feedFilters.rentalOnly === true,
        affiliateOnly: feedFilters.affiliateOnly === true,
        wholesaleOnly: feedFilters.wholesaleOnly === true,
        originalOnly: feedFilters.originalOnly === true,
        installmentOnly: feedFilters.installmentOnly === true,
        followingOnly: feedFilters.followingOnly === true,
        auctionOnly: feedFilters.auctionOnly === true,
      })
    ];

  const homeFeedContentReady = useHomeFeedContentReady({
    enabled: showHomeFeed,
    includeCuratedLists: showCuratedProductLists,
  });

  const hasAutoOpenedHomeFeedRef = useRef(false);
  const openFeedSheet = introTransition.openFeedSheet;
  const resetToIntro = introTransition.resetToIntro;

  useEffect(() => {
    if (!showHomeFeed) {
      return;
    }
    if (hasAutoOpenedHomeFeedRef.current) {
      return;
    }
    if (!IS_HOME_FEED_INTRO_BACKDROP_ENABLED) {
      hasAutoOpenedHomeFeedRef.current = true;
      openFeedSheet();
      return;
    }
    if (!homeFeedContentReady || catalogQuery.isPending) {
      return;
    }
    hasAutoOpenedHomeFeedRef.current = true;
    openFeedSheet();
  }, [
    catalogQuery.isPending,
    homeFeedContentReady,
    openFeedSheet,
    showHomeFeed,
  ]);

  // Холодный старт: держим нативный сплэш, пока каталог и все секции главной
  // не готовы — экран появляется одним кадром, без поддёргиваний от
  // догружающихся блоков. После первого показа гейт — no-op.
  useColdStartSplashGate(homeFeedContentReady && !catalogQuery.isLoading);

  useEffect(() => {
    syncHomeCatalogTabBarRevealDistance(insets.bottom);
  }, [insets.bottom]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetHomeCatalogTabBarReveal();
      };
    }, []),
  );

  useEffect(() => {
    if (showHomeFeed) {
      // Reveal таб-бара теперь ведёт переход интро↔лента (в хуке), не scrollY.
      // Без hero сразу стартуем с видимым таб-баром — иначе кадр «интро» даёт дыру.
      setHomeCatalogTabBarProgressDriven(IS_HOME_FEED_INTRO_BACKDROP_ENABLED ? 0 : 1);
    } else {
      setHomeCatalogTabBarScrollLinked(false);
    }
  }, [showHomeFeed]);

  /** Сброс категории/поиска/фильтров — вкладка index возвращается к главной ленте. */
  const resetToHomeMainView = useCallback(() => {
    setSearchInput("");
    setSubmittedSearch("");
    setSelectedRootSlug(null);
    setSelectedSubcategoryId(null);
    setSelectedSellerPersonalCategoryId(null);
    setFeedFilters(EMPTY_FEED_FILTERS);
  }, []);

  /**
   * Клик по кураторской подборке категорий (паритет с web
   * `useHomeCuratedCategoryClick`): personal-категория продавца → страница
   * продавца; иначе — фильтр каталога по категории (дерево/персональная).
   */
  const handleOpenCuratedCategory = useCallback(
    (category: HomeCuratedCategory) => {
      if (category.kind === "personal" && category.sellerId?.trim()) {
        router.push(`/seller/${category.sellerId.trim()}`);
        return;
      }
      setSearchInput("");
      setSubmittedSearch("");
      setSelectedRootSlug(null);
      setSelectedSubcategoryId(category.kind === "tree" ? category.refId : null);
      setSelectedSellerPersonalCategoryId(
        category.kind === "personal" ? category.refId : null,
      );
      setFeedFilters({ ...EMPTY_FEED_FILTERS, sort: CATALOG_SORT_NEWEST });
    },
    [router],
  );

  // Пока на вкладке index открыта категория/фильтр, нижний навбар подсвечивает
  // «Каталог», а не «Домой» (флаг читает MobileBottomTabBar).
  useEffect(() => {
    setCatalogCategoryView(!showHomeFeed);
  }, [showHomeFeed]);

  useEffect(() => () => setCatalogCategoryView(false), []);

  // Тап по вкладке «Домой»: из категории/фильтра — всегда возврат на главную
  // ленту (в т.ч. если жать с другой вкладки — там navigation.isFocused() ещё
  // false, tabPress лишь навигирует сюда). Если главная УЖЕ открыта — повторный
  // тап возвращает к интро.
  useEffect(() => {
    // tabPress эмитит таб-навигатор в рантайме; дефолтный тип навигации его не
    // объявляет — сужаем локально.
    const unsubscribe = (
      navigation as unknown as {
        addListener: (event: "tabPress", callback: () => void) => () => void;
      }
    ).addListener("tabPress", () => {
      if (!showHomeFeed) {
        resetToHomeMainView();
        return;
      }
      if (navigation.isFocused()) {
        resetToIntro();
      }
    });
    return unsubscribe;
  }, [navigation, resetToHomeMainView, resetToIntro, showHomeFeed]);

  const catalogGridRows = useMemo(
    () =>
      buildCatalogGridRows(catalogQuery.products, productGrid.columns, {
        showFullWidthTier3Banners,
        catalogNear: feedFilters.near === true,
        viewerRegionCode,
      }),
    [
      catalogQuery.products,
      feedFilters.near,
      productGrid.columns,
      showFullWidthTier3Banners,
      viewerRegionCode,
    ],
  );

  const homeFeedListRows = useMemo(
    () => buildHomeCatalogFeedListRows(catalogGridRows),
    [catalogGridRows],
  );

  const handleRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      const tasks: Promise<unknown>[] = [catalogQuery.refetch()];
      if (showHomeFeed) {
        tasks.push(invalidateHomeFeedQueries(queryClient));
      }
      await Promise.all(tasks);
    } catch {
      // individual queries surface errors via query state
    } finally {
      setIsPullRefreshing(false);
    }
  }, [catalogQuery, queryClient, showHomeFeed]);

  const isRefreshing = isPullRefreshing || catalogQuery.isRefetching;

  // Упавшая догрузка в вебе показывает ошибку и «Повторить»; молча вставшая
  // лента выглядит как конец каталога.
  const loadMoreFooter = catalogQuery.isFetchNextPageError ? (
    <View style={styles.centered}>
      <Text style={[styles.empty, { color: theme.colors.danger }]}>
        {formatApiErrorMessage(catalogQuery.error, CATALOG_LOAD_MORE_UI.FAIL)}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => catalogQuery.fetchNextPage()}
        style={styles.loadMoreRetry}
      >
        <Text style={[styles.loadMoreRetryText, { color: theme.colors.action }]}>
          {CATALOG_LOAD_MORE_UI.RETRY}
        </Text>
      </Pressable>
    </View>
  ) : null;

  const handleLoadMore = () => {
    if (
      catalogQuery.hasNextPage &&
      !catalogQuery.isFetchingNextPage &&
      !catalogQuery.isFetchNextPageError
    ) {
      catalogQuery.fetchNextPage();
    }
  };

  const searchRow = (
    <HomeCatalogSearchRow
      value={searchInput}
      onChange={handleSearchInputChange}
      onSubmit={handleSearchSubmit}
      embeddedInForegroundSheet={showHomeFeed}
    />
  );

  const listHeader = (
    <HomeFeedListHeader
      showHomeFeed={showHomeFeed}
      showCuratedLists={showCuratedProductLists}
      catalogBreadcrumbLabel={catalogBreadcrumbLabel}
      isCatalogEmpty={false}
      emptyLabel={catalogEmptyLabel}
      styles={styles}
      onOpenCuratedCategory={handleOpenCuratedCategory}
    />
  );

  const feedHeaderElement = useMemo(
    () => (
      <HomeFeedListHeader
        showHomeFeed
        showCuratedLists={showCuratedProductLists}
        catalogBreadcrumbLabel={catalogBreadcrumbLabel}
        isCatalogEmpty={catalogGridRows.length === 0}
        emptyLabel={catalogEmptyLabel}
        styles={styles}
        onOpenCuratedCategory={handleOpenCuratedCategory}
      />
    ),
    [
      catalogBreadcrumbLabel,
      catalogEmptyLabel,
      catalogGridRows.length,
      handleOpenCuratedCategory,
      showCuratedProductLists,
      styles,
    ],
  );

  const homeFeedListFooter = (
    <View style={styles.homeFeedSheetFiller} />
  );

  /** Safe-area + web sticky top gap; шапка в потоке списка (не absolute overlay). */
  const homeFeedScrollTopInset = insets.top + HOME_CATALOG_HEADER_STICKY_TOP_OFFSET;

  const homeFeedContentContainerStyle = useMemo(
    (): ViewStyle[] => [
      styles.homeFeedListContent,
      {
        paddingTop: homeFeedScrollTopInset,
        paddingBottom: contentPaddingBottom,
        paddingHorizontal: contentPaddingHorizontal,
        minHeight: windowHeight,
        flexGrow: 1,
      },
    ],
    [
      contentPaddingBottom,
      contentPaddingHorizontal,
      homeFeedScrollTopInset,
      styles.homeFeedListContent,
      windowHeight,
    ],
  );

  // Колонка как web `.app-shell` (max-width). Padding — в contentContainer.
  const homeFeedShellStyle = centeredContentStyle;

  const homeFeedSearchListHeader = (
    <View style={styles.homeFeedSearchHeader}>
      <HomeCatalogEmbeddedSearchRow />
    </View>
  );

  const renderHomeFeedRow = useCallback(
    ({ item, index }: { item: HomeCatalogFeedListRow; index: number }) => {
      if (!item) {
        return null;
      }

      if (item.kind === "feed-header") {
        return (
          <View style={[styles.homeFeedRowSurface, styles.homeFeedInsetContent, styles.homeFeedForeground]}>
            {feedHeaderElement}
          </View>
        );
      }

      if (item.kind !== "product" || !item.row) {
        return null;
      }

      const productRowIndex = index - HOME_CATALOG_FEED_META_ROW_COUNT;

      return (
        <RowVisibilityBoundary rowKey={item.key}>
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
              disableEntering
            />
          </View>
        </RowVisibilityBoundary>
      );
    },
    [
      feedHeaderElement,
      productGrid.columns,
      productGrid.gap,
      productGrid.tileWidth,
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

  const renderCatalogGridRow = useCallback(
    ({ item, index }: { item: CatalogGridRow; index: number }) => {
      if (!item) {
        return null;
      }

      return (
        <RowVisibilityBoundary rowKey={item.key}>
          <CatalogGridRowItem
            row={item}
            columns={productGrid.columns}
            gap={productGrid.gap}
            tileWidth={productGrid.tileWidth}
            rowIndex={index}
            disableEntering
          />
        </RowVisibilityBoundary>
      );
    },
    [productGrid.columns, productGrid.gap, productGrid.tileWidth],
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
          {IS_HOME_FEED_INTRO_BACKDROP_ENABLED ? <HomeCatalogPrimaryBackdrop /> : null}
          <View style={[styles.homeFeedPendingSheet, styles.homeFeedForeground]}>
            <HomeCatalogFeedSheetCap />
            <View style={[styles.flex, homeFeedShellStyle]}>
              <View
                style={[
                  styles.homeFeedInsetContent,
                  {
                    paddingTop: homeFeedScrollTopInset,
                    paddingHorizontal: contentPaddingHorizontal,
                  },
                ]}
              >
                {searchRow}
                {listHeader}
                <CatalogGridSkeleton
                  columns={productGrid.columns}
                  tileWidth={productGrid.tileWidth}
                  gap={productGrid.gap}
                />
              </View>
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
          {IS_HOME_FEED_INTRO_BACKDROP_ENABLED ? <HomeCatalogPrimaryBackdrop /> : null}
          <View style={[styles.homeFeedPendingSheet, styles.homeFeedForeground]}>
            <HomeCatalogFeedSheetCap />
            <View style={[styles.flex, homeFeedShellStyle]}>
              <View
                style={[
                  styles.homeFeedInsetContent,
                  {
                    paddingTop: homeFeedScrollTopInset,
                    paddingHorizontal: contentPaddingHorizontal,
                  },
                ]}
              >
                {searchRow}
                {listHeader}
                <ScreenErrorState
                  message={formatApiErrorMessage(catalogQuery.error, API_CLIENT_UI.CATALOG_ERROR)}
                  onRetry={() => catalogQuery.refetch()}
                />
              </View>
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
        <VisibleRowsProvider store={rowVisibility.store}>
        <HomeCatalogSearchProvider
          value={searchInput}
          onChange={handleSearchInputChange}
          onSubmit={handleSearchSubmit}
        >
          {renderHomeFeedScene(
            <GestureDetector gesture={introTransition.panGesture}>
              <View style={styles.homeFeedStage}>
                {IS_HOME_FEED_INTRO_BACKDROP_ENABLED ? (
                  <View
                    pointerEvents="box-none"
                    style={[styles.homeFeedIntroBackdropLayer, { height: homeFeedDockOffset }]}
                  >
                    <HomeCatalogPrimaryBackdrop
                      playbackActive={
                        introTransition.backdropPlaybackActive && isFocused && appActive
                      }
                    />
                  </View>
                ) : null}
                <Animated.View style={[styles.homeFeedSheet, introTransition.sheetStyle]}>
                  <View style={[styles.flex, homeFeedShellStyle]}>
                    <GestureDetector gesture={introTransition.nativeGesture}>
                      <CatalogAnimatedFlatList<HomeCatalogFeedListRow>
                        ref={catalogListRef as Ref<Animated.FlatList<HomeCatalogFeedListRow>>}
                        key={`${productGrid.listKey}-home-feed`}
                        data={homeFeedListRows}
                        keyExtractor={(item) => item.key}
                        numColumns={1}
                        trackCatalogScroll={false}
                        ListHeaderComponent={homeFeedSearchListHeader}
                        renderItem={renderHomeFeedRow}
                        onViewableItemsChanged={rowVisibility.onViewableItemsChanged}
                        viewabilityConfig={rowVisibility.viewabilityConfig}
                        contentContainerStyle={homeFeedContentContainerStyle}
                        style={resolveHomeCatalogFeedListStyle(styles.flex, styles.homeFeedList)}
                        scrollEnabled={introTransition.scrollEnabled}
                        {...homeCatalogFeedListScrollProps}
                        {...homeCatalogFeedListPerformanceProps}
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
                            {loadMoreFooter}
                            {homeFeedListFooter}
                          </View>
                        }
                      />
                    </GestureDetector>
                  </View>
                </Animated.View>
              </View>
            </GestureDetector>,
          )}
        </HomeCatalogSearchProvider>
        </VisibleRowsProvider>
      </CatalogScrollAnimationProvider>
    );
  }

  return (
    <CatalogScrollAnimationProvider>
      <VisibleRowsProvider store={rowVisibility.store}>
      <View style={[styles.flex, centeredContentStyle]}>
        {searchRow}
        <CatalogAnimatedFlatList<CatalogGridRow>
          ref={catalogListRef as Ref<Animated.FlatList<CatalogGridRow>>}
          key={`${productGrid.listKey}-${catalogListScopeKey}`}
          data={catalogGridRows}
          keyExtractor={(item) => item.key}
          numColumns={1}
          ListHeaderComponent={listHeader}
          renderItem={renderCatalogGridRow}
          contentContainerStyle={catalogContentContainerStyle}
          style={styles.flex}
          {...catalogGridListPerformanceProps}
          onViewableItemsChanged={rowVisibility.onViewableItemsChanged}
          viewabilityConfig={rowVisibility.viewabilityConfig}
          refreshControl={
            <ThemedRefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.empty}>{catalogEmptyLabel}</Text>
            </View>
          }
          ListFooterComponent={
            <>
              {catalogQuery.isFetchingNextPage ? (
                <ActivityIndicator style={styles.footerLoader} />
              ) : null}
              {loadMoreFooter}
            </>
          }
        />
      </View>
      </VisibleRowsProvider>
    </CatalogScrollAnimationProvider>
  );
}
