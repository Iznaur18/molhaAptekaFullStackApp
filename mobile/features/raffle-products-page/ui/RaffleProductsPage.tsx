import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRaffleProductsQuery } from "@/entities/raffle/model/useRaffleProductsQuery";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { RAFFLE_PRODUCTS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const RaffleProductsPage = () => {
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
    <FlatList
      data={products}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={productsQuery.isRefetching} onRefresh={productsQuery.refetch} />
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
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 6,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
  },
  footer: {
    marginVertical: 16,
  },
});
