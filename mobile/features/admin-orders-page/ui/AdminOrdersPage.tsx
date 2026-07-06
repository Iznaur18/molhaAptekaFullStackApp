import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { AdminOrder } from "@/entities/order/api/fetchAllOrdersAdmin";
import { resolveOrderLineProductId } from "@/entities/order/lib/resolveOrderLineProductId";
import { useAdminOrdersQuery } from "@/entities/order/model/useAdminOrdersQuery";
import { useOrderMutations } from "@/entities/order/model/useOrderMutations";
import { OrderCard } from "@/entities/order/ui/OrderCard";
import { OrderStatusSelect } from "@/features/admin-order-status/ui/OrderStatusSelect";
import { AdminOrdersPageToolbar } from "@/features/admin-orders-page/ui/AdminOrdersPageToolbar";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { orderQueryKeys } from "@/shared/api";
import {
  ADMIN_ORDERS_PAGE_UI,
  API_CLIENT_UI,
  MY_PROFILE_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAdminOrdersPageStyles } from "@/shared/theme/adminOrdersPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const AdminOrdersPage = () => {
  const router = useRouter();
  const styles = useAdminOrdersPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<Record<string, string>>({});

  const queryParams = useMemo(
    () => ({
      limit: ADMIN_ORDERS_PAGE_UI.PAGE_LIMIT,
      ...(statusFilter ? { status: statusFilter } : {}),
    }),
    [statusFilter],
  );

  const ordersQuery = useAdminOrdersQuery(queryParams);
  const { updateStatusMutation } = useOrderMutations();
  const orders = ordersQuery.data?.orders ?? [];

  useFocusEffect(
    useCallback(() => {
      void ordersQuery.refetch();
    }, [ordersQuery.refetch]),
  );

  const emptyMessage = statusFilter
    ? ADMIN_ORDERS_PAGE_UI.EMPTY_BY_FILTER
    : ADMIN_ORDERS_PAGE_UI.EMPTY;

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setPendingOrderId(orderId);
    setStatusError((prev) => ({ ...prev, [orderId]: "" }));

    try {
      const updated = await updateStatusMutation.mutateAsync({ orderId, status: nextStatus });
      queryClient.setQueryData<{
        orders: AdminOrder[];
        total: number;
        page: number;
        limit: number;
      }>(orderQueryKeys.adminAll(queryParams), (old) => {
        if (!old?.orders) {
          return old;
        }
        return {
          ...old,
          orders: old.orders.map((order) => (String(order._id) === orderId ? updated : order)),
        };
      });
    } catch (error) {
      setStatusError((prev) => ({
        ...prev,
        [orderId]: formatApiErrorMessage(error, API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK),
      }));
    } finally {
      setPendingOrderId(null);
    }
  };

  const handleBuyerClick = useCallback(
    (userId: string) => {
      router.push({ pathname: "/user/[id]", params: { id: userId } });
    },
    [router],
  );

  const handleProductClick = useCallback(
    (item: unknown) => {
      const productId = resolveOrderLineProductId(item);
      if (!productId) {
        return;
      }
      router.push({ pathname: "/product/[id]", params: { id: productId } });
    },
    [router],
  );

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_ADMIN_ORDERS}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="admin-orders"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

  const listHeader = (
    <View style={styles.header}>
      {sectionToggle}
      <AdminOrdersPageToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ordersCount={orders.length}
      />
      {ordersQuery.isPending ? (
        <Text style={styles.state}>{ADMIN_ORDERS_PAGE_UI.LOADING}</Text>
      ) : null}
      {ordersQuery.isError ? (
        <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
          {formatApiErrorMessage(ordersQuery.error, API_CLIENT_UI.FETCH_ALL_ORDERS_FALLBACK)}
        </Text>
      ) : null}
      {!ordersQuery.isPending && !ordersQuery.isError && orders.length === 0 ? (
        <Text style={styles.state}>{emptyMessage}</Text>
      ) : null}
    </View>
  );

  if (ordersQuery.isPending && orders.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          {listHeader}
        </View>
        {navSheet}
      </>
    );
  }

  if (ordersQuery.isError && orders.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          {listHeader}
          <ScreenErrorState
            message={formatApiErrorMessage(
              ordersQuery.error,
              API_CLIENT_UI.FETCH_ALL_ORDERS_FALLBACK,
            )}
            onRetry={() => ordersQuery.refetch()}
          />
        </View>
        {navSheet}
      </>
    );
  }

  return (
    <>
      <FlatList
        style={[styles.container, styles.listFlex, centeredContentStyle]}
        contentContainerStyle={[styles.list, { paddingBottom: contentPaddingBottom }]}
        data={orders}
        keyExtractor={(item) => String(item._id)}
        ListHeaderComponent={listHeader}
        refreshControl={
          <ThemedRefreshControl
            refreshing={ordersQuery.isFetching}
            onRefresh={() => ordersQuery.refetch()}
          />
        }
        renderItem={({ item }) => {
          const orderId = String(item._id);

          return (
            <OrderCard
              compact
              showBuyer
              order={item}
              onBuyerNameClick={handleBuyerClick}
              onProductClick={handleProductClick}
              statusSlot={
                <OrderStatusSelect
                  value={String(item.status ?? "")}
                  isPending={pendingOrderId === orderId}
                  error={statusError[orderId] ?? ""}
                  onChange={(nextStatus) => {
                    void handleStatusChange(orderId, nextStatus);
                  }}
                />
              }
            />
          );
        }}
      />

      {navSheet}
    </>
  );
};
