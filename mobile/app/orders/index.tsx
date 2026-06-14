import { orderFromApiSchema } from "@molha/api-contract";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import { Alert, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import { resolveOrderLineProductId } from "@/entities/order/lib/resolveOrderLineProductId";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
} from "@/entities/order/model/constants";
import { useOrderMutations } from "@/entities/order/model/useOrderMutations";
import { useMyOrdersQuery } from "@/entities/order/model/useMyOrdersQuery";
import { OrderCard } from "@/entities/order/ui/OrderCard";
import { orderQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  AUTH_UI,
  MY_ORDERS_PAGE_UI,
  ORDER_CARD_UI,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useOrdersScreenStyles } from "@/shared/theme/commerceScreenStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type OrderRecord = z.infer<typeof orderFromApiSchema>;

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: MY_ORDERS_PAGE_UI.STATUS_FILTER_ALL },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL_RU[status],
  })),
];

export default function MyOrdersScreen() {
  const router = useRouter();
  const styles = useOrdersScreenStyles();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const ordersQuery = useMyOrdersQuery();
  const { confirmItemMutation, cancelItemMutation } = useOrderMutations();
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [itemActionErrors, setItemActionErrors] = useState<Record<string, string>>({});
  const [loyaltyFlash, setLoyaltyFlash] = useState("");

  useEffect(() => {
    if (!loyaltyFlash) {
      return undefined;
    }
    const timerId = setTimeout(() => setLoyaltyFlash(""), 4000);
    return () => clearTimeout(timerId);
  }, [loyaltyFlash]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void ordersQuery.refetch();
      }
    }, [isAuthorized, ordersQuery.refetch]),
  );

  const patchOrders = useCallback(
    (updater: (orders: OrderRecord[]) => OrderRecord[]) => {
      queryClient.setQueryData(orderQueryKeys.my(), (old) => {
        if (!Array.isArray(old)) {
          return old;
        }
        return updater(old as OrderRecord[]);
      });
    },
    [queryClient],
  );

  const invalidateOrderQueues = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.my() }),
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.myActionCount() }),
    ]);
  }, [queryClient]);

  const handleConfirmDelivered = async ({
    orderId,
    itemIndex,
  }: {
    orderId: string;
    itemIndex: number;
  }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    patchOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) {
          return order;
        }
        const nextItems = (order.items ?? []).map((item, index) => {
          if (getOrderItemIndex(item as { itemIndex?: number }, index) !== itemIndex) {
            return item;
          }
          return { ...item, status: ORDER_STATUS_CONFIRMED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const { order: updatedOrder, pointsEarned } = await confirmItemMutation.mutateAsync({
        orderId,
        itemIndex,
      });
      if (pointsEarned > 0) {
        setLoyaltyFlash(MY_ORDERS_PAGE_UI.LOYALTY_POINTS_EARNED(pointsEarned));
      }
      patchOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      await invalidateOrderQueues();
    } catch (error) {
      const message = formatApiErrorMessage(error, API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK);
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void ordersQuery.refetch();
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleCancelItem = ({
    orderId,
    itemIndex,
  }: {
    orderId: string;
    itemIndex: number;
  }) => {
    Alert.alert(ORDER_CARD_UI.ACTION_CANCEL, ORDER_CARD_UI.BUYER_CANCEL_CONFIRM, [
      { text: PRODUCT_REPORT_UI.CANCEL, style: "cancel" },
      {
        text: ORDER_CARD_UI.ACTION_CANCEL,
        style: "destructive",
        onPress: () => {
          void runCancelItem({ orderId, itemIndex });
        },
      },
    ]);
  };

  const runCancelItem = async ({
    orderId,
    itemIndex,
  }: {
    orderId: string;
    itemIndex: number;
  }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    patchOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) {
          return order;
        }
        const nextItems = (order.items ?? []).map((item, index) => {
          if (getOrderItemIndex(item as { itemIndex?: number }, index) !== itemIndex) {
            return item;
          }
          return { ...item, status: ORDER_STATUS_CANCELLED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const updatedOrder = await cancelItemMutation.mutateAsync({ orderId, itemIndex });
      patchOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      await invalidateOrderQueues();
    } catch (error) {
      const message = formatApiErrorMessage(error, API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK);
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void ordersQuery.refetch();
    } finally {
      setPendingActionKey(null);
    }
  };

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

  const orders = ordersQuery.data ?? [];

  const filteredOrders = useMemo(() => {
    if (!statusFilter) {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const emptyMessage =
    orders.length === 0
      ? MY_ORDERS_PAGE_UI.EMPTY
      : statusFilter
        ? MY_ORDERS_PAGE_UI.EMPTY_BY_FILTER
        : MY_ORDERS_PAGE_UI.EMPTY;

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{MY_ORDERS_PAGE_UI.AUTH_REQUIRED}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>{AUTH_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (ordersQuery.isPending) {
    return <ScreenLoadingState message={MY_ORDERS_PAGE_UI.LOADING} />;
  }

  if (ordersQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          ordersQuery.error,
          API_CLIENT_UI.FETCH_MY_ORDERS_FALLBACK,
        )}
        onRetry={() => ordersQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={filteredOrders}
      keyExtractor={(order) => order._id}
      renderItem={({ item }) => (
        <OrderCard
          order={item}
          onProductClick={handleProductClick}
          onConfirmDelivered={handleConfirmDelivered}
          onCancelItem={handleCancelItem}
          pendingActionKey={pendingActionKey}
          itemActionErrors={itemActionErrors}
        />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <ThemedRefreshControl refreshing={ordersQuery.isRefetching} onRefresh={ordersQuery.refetch} />
      }
      ListHeaderComponent={
        <>
          <View style={styles.toolbarHead}>
            <Text style={styles.countLabel}>
              {MY_ORDERS_PAGE_UI.COUNT(filteredOrders.length)}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.value;
              return (
                <Pressable
                  key={filter.value || "all"}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setStatusFilter(filter.value)}
                >
                  <Text
                    style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {loyaltyFlash ? (
            <Text style={styles.loyaltyFlash} accessibilityRole="text">
              {loyaltyFlash}
            </Text>
          ) : null}
        </>
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.message}>{emptyMessage}</Text>
        </View>
      }
    />
  );
}
