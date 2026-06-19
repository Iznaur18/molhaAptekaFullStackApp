import { useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { ProductCard } from "@/entities/product/ui/ProductCard";
import { useMyProductsInfiniteQuery } from "@/entities/product/model/useMyProductsInfiniteQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { MY_PRODUCTS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useMyProductsPageStyles } from "@/shared/theme/sellerFlowStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const MyProductsPage = () => {
  const router = useRouter();
  const styles = useMyProductsPageStyles();
  const productGrid = useProductGridLayout();
  const { centeredContentStyle } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const productsQuery = useMyProductsInfiniteQuery({ enabled: isAuthorized });

  const handleLoadMore = useCallback(() => {
    if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
      void productsQuery.fetchNextPage();
    }
  }, [productsQuery]);

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{MY_PRODUCTS_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>{MY_PRODUCTS_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (productsQuery.isPending) {
    return <ScreenLoadingState message={MY_PRODUCTS_PAGE_UI.LOADING} />;
  }

  if (productsQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          productsQuery.error,
          MY_PRODUCTS_PAGE_UI.FETCH_FALLBACK,
        )}
        onRetry={() => productsQuery.refetch()}
      />
    );
  }

  const products = productsQuery.products;

  return (
    <View style={[styles.container, centeredContentStyle]}>
      <FlatList
        key={productGrid.listKey}
        data={products}
        keyExtractor={(item) => String(item._id)}
        numColumns={productGrid.columns}
        columnWrapperStyle={productGrid.columns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.list}
        refreshControl={
          <ThemedRefreshControl
            refreshing={productsQuery.isRefetching}
            onRefresh={productsQuery.refetch}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.count}>{MY_PRODUCTS_PAGE_UI.COUNT(productsQuery.total)}</Text>
            <Pressable style={styles.createButton} onPress={() => router.push("/create-product")}>
              <Text style={styles.createButtonText}>{MY_PRODUCTS_PAGE_UI.CREATE_BUTTON}</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.hint}>{MY_PRODUCTS_PAGE_UI.EMPTY}</Text>
            <Pressable style={styles.button} onPress={() => router.push("/create-product")}>
              <Text style={styles.buttonText}>{MY_PRODUCTS_PAGE_UI.CREATE_BUTTON}</Text>
            </Pressable>
          </View>
        }
        ListFooterComponent={
          productsQuery.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ProductCard product={item as Record<string, unknown> & { _id: string }} highlightCatalogPromotion={false} isMineMode />
            <View style={styles.cardActions}>
              <Pressable
                style={styles.cardAction}
                onPress={() =>
                  router.push({
                    pathname: "/edit-product/[id]",
                    params: { id: String(item._id) },
                  })
                }
              >
                <Text style={styles.cardActionText}>{MY_PRODUCTS_PAGE_UI.EDIT_BUTTON}</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
};
