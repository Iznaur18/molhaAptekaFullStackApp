import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { buildCategoryFilterChips } from "@/entities/product-category-display/lib/buildCategoryFilterChips";
import { useProductCategoryDisplaysQuery } from "@/entities/product-category-display/model/useProductCategoryDisplaysQuery";
import { useProductCategoryChildrenQuery } from "@/entities/product-category-tree/model/useProductCategoryChildrenQuery";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { useCatalogProductsInfiniteQuery } from "@/entities/product/model/useCatalogProductsInfiniteQuery";
import { CatalogCategoryChips } from "@/features/catalog-filter/ui/CatalogCategoryChips";
import { CatalogSearchBar } from "@/features/catalog-filter/ui/CatalogSearchBar";
import { CatalogSubcategoryChips } from "@/features/catalog-filter/ui/CatalogSubcategoryChips";
import {
  API_CLIENT_UI,
  CATALOG_SEARCH_DEBOUNCE_MS,
  CATALOG_SEARCH_MIN_LENGTH,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

const NUM_COLUMNS = 2;

export default function CatalogScreen() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRootSlug, setSelectedRootSlug] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

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

  const handleRootCategorySelect = (slug: string | null) => {
    setSelectedRootSlug(slug);
    setSelectedSubcategoryId(null);
  };

  const catalogFilters = useMemo(
    () => ({
      view: "main" as const,
      search: debouncedSearch || undefined,
      productCategory:
        selectedRootSlug && !selectedSubcategoryId ? selectedRootSlug : undefined,
      categoryId: selectedSubcategoryId ?? undefined,
    }),
    [debouncedSearch, selectedRootSlug, selectedSubcategoryId],
  );

  const catalogQuery = useCatalogProductsInfiniteQuery(catalogFilters);

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
});
