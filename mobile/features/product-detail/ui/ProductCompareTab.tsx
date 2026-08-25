import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useComparableProductsQuery } from "@/entities/product/model/useComparableProductsQuery";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { CatalogGridRowItem } from "@/features/catalog-grid/ui/CatalogGridRowItem";
import { PRODUCT_COMPARE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

const COMPARE_LOADER_MARGIN_VERTICAL = 16;
const COMPARE_EMPTY_PAD = 16;
const COMPARE_DEFAULT_CONTENT_PADDING_BOTTOM = 32;

type ProductCompareTabProps = {
  productId: string;
  contentPaddingBottom?: number;
  enabled?: boolean;
};

/**
 * Порт `client/.../ProductDetailsModalCompareTab.jsx`: сетка похожих товаров
 * от эндпоинта `/product/:id/compare`. В отличие от «Похожих», это один запрос
 * без пагинации — сервер сам решает, что и сколько показать.
 */
export const ProductCompareTab = ({
  productId,
  contentPaddingBottom = COMPARE_DEFAULT_CONTENT_PADDING_BOTTOM,
  enabled = true,
}: ProductCompareTabProps) => {
  const styles = useProductDetailTabStyles();
  const productGrid = useProductGridLayout();
  const compareQuery = useComparableProductsQuery({
    productId,
    enabled: enabled && String(productId ?? "").trim().length > 0,
  });

  // Мемо на самом списке: иначе `?? []` даёт новый массив на каждый рендер и
  // пересобирает сетку вхолостую.
  const compareData = compareQuery.data;
  const products = useMemo(() => compareData ?? [], [compareData]);

  const catalogGridRows = useMemo(
    () =>
      buildCatalogGridRows(products, productGrid.columns, {
        showFullWidthTier3Banners: false,
      }),
    [productGrid.columns, products],
  );

  if (compareQuery.isPending && products.length === 0) {
    return (
      <View style={localStyles.stateWrap}>
        <ActivityIndicator />
        <Text style={[styles.empty, { paddingHorizontal: productGrid.padding }]}>
          {PRODUCT_COMPARE_UI.LOADING}
        </Text>
      </View>
    );
  }

  if (compareQuery.isError && products.length === 0) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(compareQuery.error, PRODUCT_COMPARE_UI.FETCH_FALLBACK)}
        onRetry={() => {
          void compareQuery.refetch();
        }}
      />
    );
  }

  if (catalogGridRows.length === 0) {
    return (
      <Text
        style={[styles.empty, localStyles.emptyPad, { paddingHorizontal: productGrid.padding }]}
      >
        {PRODUCT_COMPARE_UI.EMPTY}
      </Text>
    );
  }

  return (
    <View
      accessibilityLabel={PRODUCT_COMPARE_UI.SECTION_ARIA}
      style={{ paddingBottom: contentPaddingBottom, gap: productGrid.gap }}
    >
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
    </View>
  );
};

const localStyles = StyleSheet.create({
  emptyPad: {
    paddingTop: COMPARE_EMPTY_PAD,
  },
  stateWrap: {
    gap: 12,
    marginVertical: COMPARE_LOADER_MARGIN_VERTICAL * 2,
  },
});
