import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { buildCategoryFilterChips } from "@/entities/product-category-display/lib/buildCategoryFilterChips";
import { useProductCategoryDisplaysQuery } from "@/entities/product-category-display/model/useProductCategoryDisplaysQuery";
import { useProductCategoryChildrenQuery } from "@/entities/product-category-tree/model/useProductCategoryChildrenQuery";
import type { CatalogListFilters, CatalogSort } from "@/entities/product/model/catalogListFilters";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { useCatalogProductsInfiniteQuery } from "@/entities/product/model/useCatalogProductsInfiniteQuery";
import { CatalogCategoryChips } from "@/features/catalog-filter/ui/CatalogCategoryChips";
import { CatalogSearchBar } from "@/features/catalog-filter/ui/CatalogSearchBar";
import { CatalogSubcategoryChips } from "@/features/catalog-filter/ui/CatalogSubcategoryChips";
import { consumePendingCatalogFilters } from "@/features/catalog-browser/model/pendingCatalogFilters";
import { HomeFeedHeader } from "@/features/home-feed/ui/HomeFeedHeader";
import { isHomeCatalogMainView } from "@/features/home-feed/lib/isHomeCatalogMainView";
import {
  API_CLIENT_UI,
  CATALOG_BROWSER_UI,
  CATALOG_SEARCH_DEBOUNCE_MS,
  CATALOG_SEARCH_MIN_LENGTH,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

const NUM_COLUMNS = 2;

type FeedFiltersState = Pick<
  CatalogListFilters,
  "sort" | "followingOnly" | "auctionOnly" | "installmentOnly" | "saleOnly"
>;

const EMPTY_FEED_FILTERS: FeedFiltersState = {
  sort: undefined,
  followingOnly: false,
  auctionOnly: false,
  installmentOnly: false,
  saleOnly: false,
};

export default function CatalogScreen() {
  const router = useRouter();
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

  const handleRefresh = useCallback(() => {
    catalogQuery.refetch();
  }, [catalogQuery]);

  const handleLoadMore = () => {
    if (catalogQuery.hasNextPage && !catalogQuery.isFetchingNextPage) {
      catalogQuery.fetchNextPage();
    }
  };

  const listHeader = (
    <View>
      <Pressable style={styles.browserLink} onPress={() => router.push("/catalog-browser")}>
        <Text style={styles.browserLinkText}>{CATALOG_BROWSER_UI.OPEN_BUTTON}</Text>
      </Pressable>
      <CatalogSearchBar value={searchInput} onChange={setSearchInput} />
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
      {showHomeFeed ? <HomeFeedHeader enabled={showHomeFeed} /> : null}
    </View>
  );

  if (catalogQuery.isPending) {
    return (
      <View style={styles.flex}>
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
        {listHeader}
        <ScreenErrorState
          message={formatApiErrorMessage(catalogQuery.error, API_CLIENT_UI.CATALOG_ERROR)}
          onRetry={() => catalogQuery.refetch()}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={catalogQuery.products}
      keyExtractor={(item) => item._id}
      numColumns={NUM_COLUMNS}
      ListHeaderComponent={listHeader}
      renderItem={({ item }) => <ProductCard product={item} />}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.row}
      refreshControl={
        <RefreshControl refreshing={catalogQuery.isRefetching} onRefresh={handleRefresh} />
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
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  listContent: {
    padding: 6,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  empty: {
    fontSize: 16,
    color: "#666",
  },
  error: {
    color: "#c62828",
    textAlign: "center",
  },
  footerLoader: {
    marginVertical: 16,
  },
  browserLink: {
    marginHorizontal: 8,
    marginBottom: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#eef4ff",
  },
  browserLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f6feb",
  },
});
