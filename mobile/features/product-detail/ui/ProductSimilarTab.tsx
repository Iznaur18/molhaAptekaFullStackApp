import { useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { resolveProductSimilarCatalogFilters } from "@/entities/product/lib/resolveProductSimilarCatalogFilters";
import { useCatalogProductsInfiniteQuery } from "@/entities/product/model/useCatalogProductsInfiniteQuery";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { CatalogGridRowItem } from "@/features/catalog-grid/ui/CatalogGridRowItem";
import { CATALOG_PAGE_SIZE, PRODUCT_SIMILAR_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

const SIMILAR_FOOTER_LOADER_MARGIN_VERTICAL = 16;
const SIMILAR_EMPTY_PAD = 16;
const SIMILAR_DEFAULT_CONTENT_PADDING_BOTTOM = 32;
/** Без виртуализации в ScrollView — жёсткий потолок страниц. */
const PRODUCT_SIMILAR_MAX_PAGES = 3;
const PRODUCT_SIMILAR_MAX_ITEMS = CATALOG_PAGE_SIZE * PRODUCT_SIMILAR_MAX_PAGES;
export const PRODUCT_SIMILAR_LOAD_MORE_THRESHOLD_PX = 240;

type ProductSimilarTabProps = {
  product: Record<string, unknown>;
  excludeProductId: string;
  contentPaddingBottom?: number;
  enabled?: boolean;
  onRegisterLoadMore?: (loadMore: (() => void) | null) => void;
};

export const ProductSimilarTab = ({
  product,
  excludeProductId,
  contentPaddingBottom = SIMILAR_DEFAULT_CONTENT_PADDING_BOTTOM,
  enabled = true,
  onRegisterLoadMore,
}: ProductSimilarTabProps) => {
  const styles = useProductDetailTabStyles();
  const productGrid = useProductGridLayout();
  const filters = resolveProductSimilarCatalogFilters(product);
  const catalogQuery = useCatalogProductsInfiniteQuery(
    {
      categoryId: filters?.categoryId,
      productCategory: filters?.productCategory,
    },
    { enabled: enabled && filters != null },
  );

  const products = useMemo(() => {
    const excludeId = excludeProductId.trim();
    return catalogQuery.products
      .filter((item) => String(item._id) !== excludeId)
      .slice(0, PRODUCT_SIMILAR_MAX_ITEMS);
  }, [catalogQuery.products, excludeProductId]);

  const catalogGridRows = useMemo(
    () =>
      buildCatalogGridRows(products, productGrid.columns, {
        showFullWidthTier3Banners: false,
      }),
    [productGrid.columns, products],
  );

  const canFetchMore =
    catalogQuery.hasNextPage === true &&
    !catalogQuery.isFetchingNextPage &&
    catalogQuery.products.length < PRODUCT_SIMILAR_MAX_ITEMS;

  const handleLoadMore = useCallback(() => {
    if (!canFetchMore) {
      return;
    }
    void catalogQuery.fetchNextPage();
  }, [canFetchMore, catalogQuery]);

  useEffect(() => {
    if (onRegisterLoadMore == null) {
      return;
    }
    onRegisterLoadMore(handleLoadMore);
    return () => {
      onRegisterLoadMore(null);
    };
  }, [handleLoadMore, onRegisterLoadMore]);

  if (filters == null) {
    return (
      <Text
        style={[styles.empty, localStyles.emptyPad, { paddingHorizontal: productGrid.padding }]}
      >
        {PRODUCT_SIMILAR_UI.EMPTY}
      </Text>
    );
  }

  if (catalogQuery.isPending && catalogGridRows.length === 0) {
    return (
      <ActivityIndicator
        style={{ marginVertical: SIMILAR_FOOTER_LOADER_MARGIN_VERTICAL * 2 }}
      />
    );
  }

  if (catalogQuery.isError && catalogGridRows.length === 0) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(catalogQuery.error, PRODUCT_SIMILAR_UI.FETCH_FALLBACK)}
        onRetry={() => {
          void catalogQuery.refetch();
        }}
      />
    );
  }

  if (catalogGridRows.length === 0) {
    return (
      <Text
        style={[styles.empty, localStyles.emptyPad, { paddingHorizontal: productGrid.padding }]}
      >
        {PRODUCT_SIMILAR_UI.EMPTY}
      </Text>
    );
  }

  return (
    <View style={{ paddingBottom: contentPaddingBottom, gap: productGrid.gap }}>
      {catalogGridRows.map((item, index) => (
        <View key={item.key} style={{ paddingHorizontal: productGrid.padding }}>
          <CatalogGridRowItem
            row={item}
            columns={productGrid.columns}
            gap={productGrid.gap}
            tileWidth={productGrid.tileWidth}
            rowIndex={index}
            disableEntering
          />
        </View>
      ))}
      {catalogQuery.isFetchingNextPage ? (
        <ActivityIndicator
          style={{ marginVertical: SIMILAR_FOOTER_LOADER_MARGIN_VERTICAL }}
        />
      ) : null}
    </View>
  );
};

export const isProductSimilarScrollNearEnd = (params: {
  contentOffsetY: number;
  contentHeight: number;
  layoutHeight: number;
}): boolean => {
  const distanceFromEnd =
    params.contentHeight - params.layoutHeight - params.contentOffsetY;
  return distanceFromEnd < PRODUCT_SIMILAR_LOAD_MORE_THRESHOLD_PX;
};

const localStyles = StyleSheet.create({
  emptyPad: {
    paddingTop: SIMILAR_EMPTY_PAD,
  },
});
