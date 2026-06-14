import { FlatList, RefreshControl, StyleSheet, Text } from "react-native";

import { useAdminOrdersQuery } from "@/entities/order/model/useAdminOrdersQuery";
import { OrderCard } from "@/entities/order/ui/OrderCard";
import { ADMIN_ORDERS_PAGE_UI } from "@/shared/config";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const AdminOrdersPage = () => {
  const ordersQuery = useAdminOrdersQuery({ limit: 50 });
  const orders = ordersQuery.data?.orders ?? [];

  if (ordersQuery.isPending && orders.length === 0) {
    return <ScreenLoadingState message={ADMIN_ORDERS_PAGE_UI.LOADING} />;
  }

  if (ordersQuery.isError && orders.length === 0) {
    return (
      <ScreenErrorState
        message={
          ordersQuery.error instanceof Error
            ? ordersQuery.error.message
            : ADMIN_ORDERS_PAGE_UI.FETCH_FALLBACK
        }
        onRetry={() => void ordersQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => String(item._id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={ordersQuery.isFetching} onRefresh={() => void ordersQuery.refetch()} />
      }
      ListEmptyComponent={<Text style={styles.empty}>{ADMIN_ORDERS_PAGE_UI.EMPTY}</Text>}
      renderItem={({ item }) => <OrderCard order={item} />}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 12, gap: 12 },
  empty: { textAlign: "center", color: "#666", padding: 24 },
});
