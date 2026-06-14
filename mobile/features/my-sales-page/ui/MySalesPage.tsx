import { orderFromApiSchema } from "@molha/api-contract";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import type { z } from "zod";
import { Alert, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
  type OrderStatus,
} from "@/entities/order/model/constants";
import { useMySalesQuery } from "@/entities/order/model/useMySalesQuery";
import { useOrderMutations } from "@/entities/order/model/useOrderMutations";
import { OrderCard } from "@/entities/order/ui/OrderCard";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { orderQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  MY_SALES_PAGE_UI,
  ORDER_CARD_UI,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useOrdersScreenStyles } from "@/shared/theme/commerceScreenStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type OrderRecord = z.infer<typeof orderFromApiSchema>;

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: MY_SALES_PAGE_UI.STATUS_FILTER_ALL },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL_RU[status],
  })),
];

export const MySalesPage = () => {
  const router = useRouter();
  const styles = useOrdersScreenStyles();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const [statusFilter, setStatusFilter] = useState("");
  const salesQuery = useMySalesQuery({
    status: statusFilter || undefined,
    enabled: isAuthorized,
  });
  const { cancelItemMutation, shipItemMutation, deliverItemMutation } = useOrderMutations();
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [itemActionErrors, setItemActionErrors] = useState<Record<string, string>>({});

  const salesParams = statusFilter ? { status: statusFilter } : {};

  const patchSales = useCallback(
    (updater: (orders: OrderRecord[]) => OrderRecord[]) => {
      queryClient.setQueryData(orderQueryKeys.sales(salesParams), (old) => {
        if (!old || typeof old !== "object" || !("orders" in old)) {
          return old;
        }
        const page = old as { orders: OrderRecord[] };
        return {
          ...page,
          orders: updater(page.orders),
        };
      });
    },
    [queryClient, salesParams],
  );

  const runSellerAction = async ({
    orderId,
    itemIndex,
    optimisticStatus,
    mutate,
  }: {
    orderId: string;
    itemIndex: number;
    optimisticStatus: OrderStatus;
    mutate: () => Promise<OrderRecord>;
  }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    patchSales((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) {
          return order;
        }
        const nextItems = (order.items ?? []).map((item, index) => {
          if (getOrderItemIndex(item as { itemIndex?: number }, index) !== itemIndex) {
            return item;
          }
          return { ...item, status: optimisticStatus };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const updatedOrder = await mutate();
      patchSales((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      void salesQuery.refetch();
    } catch (error) {
      const message = formatApiErrorMessage(error, API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK);
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void salesQuery.refetch();
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleMarkShipped = ({
    orderId,
    itemIndex,
  }: {
    orderId: string;
    itemIndex: number;
  }) => {
    void runSellerAction({
      orderId,
      itemIndex,
      optimisticStatus: ORDER_STATUS_SHIPPED,
      mutate: () => shipItemMutation.mutateAsync({ orderId, itemIndex }),
    });
  };

  const handleMarkDelivered = ({
    orderId,
    itemIndex,
  }: {
    orderId: string;
    itemIndex: number;
  }) => {
    void runSellerAction({
      orderId,
      itemIndex,
      optimisticStatus: ORDER_STATUS_DELIVERED,
      mutate: () => deliverItemMutation.mutateAsync({ orderId, itemIndex }),
    });
  };

  const handleCancelItem = ({
    orderId,
    itemIndex,
  }: {
    orderId: string;
    itemIndex: number;
  }) => {
    Alert.alert(ORDER_CARD_UI.ACTION_CANCEL, ORDER_CARD_UI.SELLER_CANCEL_CONFIRM, [
      { text: PRODUCT_REPORT_UI.CANCEL, style: "cancel" },
      {
        text: ORDER_CARD_UI.ACTION_CANCEL,
        style: "destructive",
        onPress: () => {
          void runSellerAction({
            orderId,
            itemIndex,
            optimisticStatus: ORDER_STATUS_CANCELLED,
            mutate: () => cancelItemMutation.mutateAsync({ orderId, itemIndex }),
          });
        },
      },
    ]);
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{MY_SALES_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>{MY_SALES_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (salesQuery.isPending) {
    return <ScreenLoadingState message={MY_SALES_PAGE_UI.LOADING} />;
  }

  if (salesQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(salesQuery.error, MY_SALES_PAGE_UI.FETCH_FALLBACK)}
        onRetry={() => salesQuery.refetch()}
      />
    );
  }

  const orders = salesQuery.data?.orders ?? [];

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => order._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <ThemedRefreshControl refreshing={salesQuery.isRefetching} onRefresh={salesQuery.refetch} />
      }
      ListHeaderComponent={
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
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.hint}>
            {statusFilter ? MY_SALES_PAGE_UI.EMPTY_BY_FILTER : MY_SALES_PAGE_UI.EMPTY}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <OrderCard
          order={item}
          onMarkShipped={handleMarkShipped}
          onMarkDelivered={handleMarkDelivered}
          onCancelItem={handleCancelItem}
          pendingActionKey={pendingActionKey}
          itemActionErrors={itemActionErrors}
        />
      )}
    />
  );
};
