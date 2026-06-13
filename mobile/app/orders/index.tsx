import { orderFromApiSchema } from "@molha/api-contract";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import type { z } from "zod";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
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
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type OrderRecord = z.infer<typeof orderFromApiSchema>;

export default function MyOrdersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const ordersQuery = useMyOrdersQuery();
  const { confirmItemMutation, cancelItemMutation } = useOrderMutations();
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
      void ordersQuery.refetch();
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
      void ordersQuery.refetch();
    } catch (error) {
      const message = formatApiErrorMessage(error, API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK);
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void ordersQuery.refetch();
    } finally {
      setPendingActionKey(null);
    }
  };

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

  const orders = ordersQuery.data ?? [];

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => order._id}
      renderItem={({ item }) => (
        <OrderCard
          order={item}
          onConfirmDelivered={handleConfirmDelivered}
          onCancelItem={handleCancelItem}
          pendingActionKey={pendingActionKey}
          itemActionErrors={itemActionErrors}
        />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={ordersQuery.isRefetching} onRefresh={ordersQuery.refetch} />
      }
      ListHeaderComponent={
        loyaltyFlash ? (
          <Text style={styles.loyaltyFlash} accessibilityRole="text">
            {loyaltyFlash}
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.message}>{MY_ORDERS_PAGE_UI.EMPTY}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  error: {
    color: "#c62828",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loyaltyFlash: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
