import { orderFromApiSchema } from "@molha/api-contract";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import { orderMatchesMyOrdersFilters } from "@/entities/order/lib/filterMyOrders";
import { projectMyOrdersSellerBlocks } from "@/entities/order/lib/projectMyOrdersSellerBlocks";
import { resolveOrderLineProductId } from "@/entities/order/lib/resolveOrderLineProductId";
import { summarizeMyOrders } from "@/entities/order/lib/summarizeMyOrders";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
} from "@/entities/order/model/constants";
import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "@/entities/order/model/myOrdersListFilters";
import { useMyOrdersQuery } from "@/entities/order/model/useMyOrdersQuery";
import { useOrderMutations } from "@/entities/order/model/useOrderMutations";
import { OrderCard } from "@/entities/order/ui/OrderCard";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { MyOrdersPageOverview } from "@/features/my-orders-page/ui/MyOrdersPageOverview";
import { MyOrdersPageToolbar } from "@/features/my-orders-page/ui/MyOrdersPageToolbar";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { orderQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  AUTH_UI,
  MY_ORDERS_PAGE_UI,
  MY_PROFILE_PAGE_UI,
  ORDER_CARD_UI,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useMyOrdersPageStyles } from "@/shared/theme/myOrdersPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type OrderRecord = z.infer<typeof orderFromApiSchema>;

const EMPTY_ORDERS: OrderRecord[] = [];

export const MyOrdersPage = () => {
  const router = useRouter();
  const styles = useMyOrdersPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const ordersQuery = useMyOrdersQuery();
  const { confirmItemMutation, cancelItemMutation } = useOrderMutations();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [itemActionErrors, setItemActionErrors] = useState<Record<string, string>>({});
  const [loyaltyFlash, setLoyaltyFlash] = useState("");

  const allOrders = ordersQuery.data ?? EMPTY_ORDERS;
  const sellerBlocks = useMemo(
    () => projectMyOrdersSellerBlocks(allOrders),
    [allOrders],
  );
  const summary = useMemo(
    () => summarizeMyOrders(sellerBlocks.map((block) => block.order)),
    [sellerBlocks],
  );
  const filteredBlocks = useMemo(
    () =>
      sellerBlocks.filter((block) =>
        orderMatchesMyOrdersFilters(block.order, {
          status: statusFilter,
          attentionOnly,
        }),
      ),
    [sellerBlocks, statusFilter, attentionOnly],
  );

  const totalAll = sellerBlocks.length;
  const totalVisible = filteredBlocks.length;
  const hasFilters = Boolean(statusFilter) || attentionOnly;
  const summaryCountLabel = hasFilters
    ? MY_ORDERS_PAGE_UI.COUNT_FILTERED(totalVisible, totalAll)
    : MY_ORDERS_PAGE_UI.COUNT_ITEMS(totalAll);

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
    await queryClient.invalidateQueries({ queryKey: orderQueryKeys.myActionCount() });
  }, [queryClient]);

  const handleRefresh = useCallback(async () => {
    await ordersQuery.refetch();
    await invalidateOrderQueues();
  }, [ordersQuery, invalidateOrderQueues]);

  const handleInProgressFilterClick = useCallback(() => {
    setStatusFilter(MY_ORDERS_LIST_FILTER_IN_PROGRESS);
    setAttentionOnly(false);
  }, []);

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
      await invalidateOrderQueues();
      void ordersQuery.refetch();
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

  const handleSellerNameClick = useCallback(
    (userId: string) => {
      router.push({ pathname: "/user/[id]", params: { id: userId } });
    },
    [router],
  );

  const emptyMessage =
    totalAll === 0
      ? MY_ORDERS_PAGE_UI.EMPTY
      : hasFilters
        ? MY_ORDERS_PAGE_UI.EMPTY_BY_FILTER
        : MY_ORDERS_PAGE_UI.EMPTY;

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_MY_ORDERS}
        onPress={() => setNavSheetVisible(true)}
      />
      <MyOrdersPageToolbar
        summaryCountLabel={summaryCountLabel}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          if (value) {
            setAttentionOnly(false);
          }
        }}
      />
      <MyOrdersPageOverview
        inProgressCount={summary.inProgressCount}
        attentionCount={summary.attentionCount}
        totalAmountRub={summary.totalAmountRub}
        attentionOnly={attentionOnly}
        onInProgressFilterClick={handleInProgressFilterClick}
        onAttentionFilterChange={setAttentionOnly}
      />
      {totalVisible > 0 && attentionOnly ? (
        <Text style={styles.filterHint}>{MY_ORDERS_PAGE_UI.ATTENTION_FILTER_HINT}</Text>
      ) : null}
      {loyaltyFlash ? (
        <Text style={styles.loyaltyFlash} accessibilityRole="text">
          {loyaltyFlash}
        </Text>
      ) : null}
      {totalVisible === 0 ? (
        <Text style={styles.emptyState} accessibilityRole="text">
          {emptyMessage}
        </Text>
      ) : null}
    </View>
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{MY_ORDERS_PAGE_UI.AUTH_REQUIRED}</Text>
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
    <>
      <FlatList
        style={[styles.container, styles.listFlex, centeredContentStyle]}
        data={filteredBlocks}
        keyExtractor={(block) => block.blockKey}
        contentContainerStyle={[styles.list, { paddingBottom: contentPaddingBottom }]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={ordersQuery.isRefetching}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item: block }) => (
          <OrderCard
            order={block.order}
            style={styles.orderCardInList}
            compact
            showSeller
            onSellerNameClick={handleSellerNameClick}
            onProductClick={handleProductClick}
            onConfirmDelivered={handleConfirmDelivered}
            onCancelItem={handleCancelItem}
            pendingActionKey={pendingActionKey}
            itemActionErrors={itemActionErrors}
          />
        )}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="my-orders"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
