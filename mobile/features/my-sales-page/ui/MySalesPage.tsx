import { orderFromApiSchema } from "@molha/api-contract";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import { filterMySales } from "@/entities/order/lib/filterMySales";
import {
  buildAttentionOrderIdsKey,
  mergeExpandedIdsFromKey,
} from "@/entities/order/lib/expandedOrderIds";
import { orderNeedsSellerAttention } from "@/entities/order/lib/orderNeedsSellerAttention";
import { resolveOrderLineProductId } from "@/entities/order/lib/resolveOrderLineProductId";
import { summarizeMySales } from "@/entities/order/lib/summarizeMySales";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
} from "@/entities/order/model/constants";
import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "@/entities/order/model/myOrdersListFilters";
import { useMySalesQuery } from "@/entities/order/model/useMySalesQuery";
import { useOrderMutations } from "@/entities/order/model/useOrderMutations";
import { OrderCard } from "@/entities/order/ui/OrderCard";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { normalizeTotalSalesCount } from "@/entities/user/lib/formatSearchRowTotalSales";
import { MySalesPageOverview } from "@/features/my-sales-page/ui/MySalesPageOverview";
import { MySalesPageToolbar } from "@/features/my-sales-page/ui/MySalesPageToolbar";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { orderQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  MY_PROFILE_PAGE_UI,
  MY_SALES_PAGE_UI,
  ORDER_CARD_UI,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useMySalesPageStyles } from "@/shared/theme/mySalesPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type OrderRecord = z.infer<typeof orderFromApiSchema>;

const EMPTY_ORDERS: OrderRecord[] = [];

export const MySalesPage = () => {
  const router = useRouter();
  const styles = useMySalesPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, MY_SALES_PAGE_UI.SEARCH_DEBOUNCE_MS);
  const isSearchPending = searchTerm !== debouncedSearchTerm;
  const hasSearchQuery = debouncedSearchTerm.trim() !== "";

  const serverStatusFilter =
    statusFilter === MY_ORDERS_LIST_FILTER_IN_PROGRESS ? "" : statusFilter;

  const salesParams = useMemo(
    () => ({
      ...(serverStatusFilter ? { status: serverStatusFilter } : {}),
      ...(hasSearchQuery ? { search: debouncedSearchTerm.trim() } : {}),
    }),
    [serverStatusFilter, hasSearchQuery, debouncedSearchTerm],
  );

  const overviewQuery = useMySalesQuery({ enabled: isAuthorized });
  const salesQuery = useMySalesQuery({
    status: salesParams.status,
    search: salesParams.search,
    enabled: isAuthorized,
  });
  const { cancelItemMutation, shipItemMutation, deliverItemMutation } = useOrderMutations();
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [itemActionErrors, setItemActionErrors] = useState<Record<string, string>>({});

  const sellerTotalSalesCount = useMemo(
    () => normalizeTotalSalesCount(sessionQuery.data?.user?.totalSalesCount),
    [sessionQuery.data?.user?.totalSalesCount],
  );

  const allOrders = overviewQuery.data?.orders ?? EMPTY_ORDERS;
  const serverOrders = salesQuery.data?.orders ?? EMPTY_ORDERS;
  const summary = useMemo(() => summarizeMySales(allOrders), [allOrders]);
  const filteredOrders = useMemo(
    () => filterMySales(serverOrders, { statusFilter, attentionOnly }),
    [serverOrders, statusFilter, attentionOnly],
  );
  const attentionOrderIdsKey = useMemo(
    () => buildAttentionOrderIdsKey(allOrders, orderNeedsSellerAttention),
    [allOrders],
  );

  const totalServer = serverOrders.length;
  const totalVisible = filteredOrders.length;
  const hasClientFilters =
    statusFilter === MY_ORDERS_LIST_FILTER_IN_PROGRESS || attentionOnly;
  const hasFilters = Boolean(serverStatusFilter) || hasSearchQuery || hasClientFilters;
  const summaryCountLabel = hasFilters
    ? MY_SALES_PAGE_UI.COUNT_FILTERED(totalVisible, totalServer)
    : MY_SALES_PAGE_UI.COUNT_ITEMS(totalServer);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void salesQuery.refetch();
        void overviewQuery.refetch();
      }
    }, [isAuthorized, salesQuery.refetch, overviewQuery.refetch]),
  );

  useEffect(() => {
    setExpandedIds((prev) => mergeExpandedIdsFromKey(prev, attentionOrderIdsKey));
  }, [attentionOrderIdsKey]);

  const invalidateSalesQueues = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: orderQueryKeys.salesActionCount() });
  }, [queryClient]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([salesQuery.refetch(), overviewQuery.refetch()]);
    await invalidateSalesQueues();
  }, [salesQuery, overviewQuery, invalidateSalesQueues]);

  const toggleExpanded = useCallback((orderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(filteredOrders.map((order) => String(order._id))));
  }, [filteredOrders]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleInProgressFilterClick = useCallback(() => {
    setStatusFilter(MY_ORDERS_LIST_FILTER_IN_PROGRESS);
    setAttentionOnly(false);
  }, []);

  const patchSalesCaches = useCallback(
    (updater: (orders: OrderRecord[]) => OrderRecord[]) => {
      for (const params of [salesParams, {}]) {
        queryClient.setQueryData(orderQueryKeys.sales(params), (old) => {
          if (!old || typeof old !== "object" || !("orders" in old)) {
            return old;
          }
          const page = old as { orders: OrderRecord[] };
          return {
            ...page,
            orders: updater(page.orders),
          };
        });
      }
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
    optimisticStatus: string;
    mutate: () => Promise<OrderRecord>;
  }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    patchSalesCaches((prev) =>
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
      patchSalesCaches((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      await invalidateSalesQueues();
      void handleRefresh();
    } catch (error) {
      const message = formatApiErrorMessage(error, API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK);
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void handleRefresh();
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
    Alert.alert(ORDER_CARD_UI.ACTION_CANCEL, ORDER_CARD_UI.CANCEL_CONFIRM, [
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

  const handleBuyerNameClick = useCallback(
    (userId: string) => {
      router.push({ pathname: "/user/[id]", params: { id: userId } });
    },
    [router],
  );

  const emptyMessage = hasSearchQuery
    ? MY_SALES_PAGE_UI.EMPTY_BY_SEARCH
    : hasFilters
      ? MY_SALES_PAGE_UI.EMPTY_BY_FILTER
      : MY_SALES_PAGE_UI.EMPTY;

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_MY_SALES}
        onPress={() => setNavSheetVisible(true)}
      />
      <MySalesPageToolbar
        summaryCountLabel={summaryCountLabel}
        totalSalesCount={sellerTotalSalesCount}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          if (value) {
            setAttentionOnly(false);
          }
        }}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        isSearchPending={isSearchPending}
      />
      <MySalesPageOverview
        inProgressCount={summary.inProgressCount}
        attentionCount={summary.attentionCount}
        totalAmountRub={summary.totalAmountRub}
        attentionOnly={attentionOnly}
        onInProgressFilterClick={handleInProgressFilterClick}
        onAttentionFilterChange={setAttentionOnly}
      />
      {totalVisible > 0 ? (
        <View style={styles.listActions}>
          <Pressable style={styles.listAction} onPress={expandAll}>
            <Text style={styles.listActionText}>{MY_SALES_PAGE_UI.EXPAND_ALL}</Text>
          </Pressable>
          <Pressable style={styles.listAction} onPress={collapseAll}>
            <Text style={styles.listActionText}>{MY_SALES_PAGE_UI.COLLAPSE_ALL}</Text>
          </Pressable>
          {attentionOnly ? (
            <Text style={styles.filterHint}>{MY_SALES_PAGE_UI.ATTENTION_FILTER_HINT}</Text>
          ) : null}
        </View>
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

  return (
    <>
      <FlatList
        style={[styles.container, styles.listFlex, centeredContentStyle]}
        data={filteredOrders}
        keyExtractor={(order) => order._id}
        contentContainerStyle={[styles.list, { paddingBottom: contentPaddingBottom }]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={salesQuery.isRefetching || overviewQuery.isRefetching}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => {
          const orderId = String(item._id);
          return (
            <OrderCard
              order={item}
              style={styles.orderCardInList}
              compact
              collapsible
              expanded={expandedIds.has(orderId)}
              onExpandedChange={() => toggleExpanded(orderId)}
              attentionRole="seller"
              showBuyer
              onBuyerNameClick={handleBuyerNameClick}
              onProductClick={handleProductClick}
              onMarkShipped={handleMarkShipped}
              onMarkDelivered={handleMarkDelivered}
              onCancelItem={handleCancelItem}
              pendingActionKey={pendingActionKey}
              itemActionErrors={itemActionErrors}
            />
          );
        }}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="my-sales"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
