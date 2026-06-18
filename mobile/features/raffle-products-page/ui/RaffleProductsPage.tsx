import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useRaffleProductsQuery } from "@/entities/raffle/model/useRaffleProductsQuery";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { RAFFLE_PRODUCTS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useRaffleProductsPageStyles } from "@/shared/theme/commerceScreenStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const RaffleProductsPage = () => {
  const styles = useRaffleProductsPageStyles();
  const productGrid = useProductGridLayout();
  const { centeredContentStyle } = useScreenLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const raffleId = Array.isArray(id) ? id[0] : id ?? "";
  const productsQuery = useRaffleProductsQuery(raffleId, Boolean(raffleId));

  if (productsQuery.isPending) {
    return <ScreenLoadingState message={RAFFLE_PRODUCTS_PAGE_UI.LOADING} />;
  }

  if (productsQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          productsQuery.error,
          RAFFLE_PRODUCTS_PAGE_UI.FETCH_FALLBACK,
        )}
        onRetry={() => productsQuery.refetch()}
      />
    );
  }

  const products = productsQuery.data?.products ?? [];

  return (
    <View style={[styles.flex, centeredContentStyle]}>
      <FlatList
        key={productGrid.listKey}
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={productGrid.columns}
        columnWrapperStyle={productGrid.columns > 1 ? styles.row : undefined}
        style={styles.flex}
        contentContainerStyle={styles.list}
        refreshControl={
          <ThemedRefreshControl
            refreshing={productsQuery.isRefetching}
            onRefresh={productsQuery.refetch}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{RAFFLE_PRODUCTS_PAGE_UI.EMPTY}</Text>
          </View>
        }
        ListFooterComponent={
          productsQuery.isFetching ? <ActivityIndicator style={styles.footer} /> : null
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
};
