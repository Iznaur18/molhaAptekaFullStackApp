import { orderFromApiSchema } from "@molha/api-contract";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import type { z } from "zod";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import { resolveOrderLineProductId } from "@/entities/order/lib/resolveOrderLineProductId";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
} from "@/entities/order/model/constants";
import { useMySalesQuery } from "@/entities/order/model/useMySalesQuery";
import { useOrderMutations } from "@/entities/order/model/useOrderMutations";
import { OrderCard } from "@/entities/order/ui/OrderCard";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { normalizeTotalSalesCount } from "@/entities/user/lib/formatSearchRowTotalSales";
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

export const MySalesPage = () => {
  const router = useRouter();
  const styles = useMySalesPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, MY_SALES_PAGE_UI.SEARCH_DEBOUNCE_MS);
  const isSearchPending = searchTerm !== debouncedSearchTerm;
  const hasSearchQuery = debouncedSearchTerm.trim() !== "";

  const salesParams = useMemo(
    () => ({
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(hasSearchQuery ? { search: debouncedSearchTerm.trim() } : {}),
    }),
    [statusFilter, hasSearchQuery, debouncedSearchTerm],
  );

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

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void salesQuery.refetch();
      }
    }, [isAuthorized, salesQuery.refetch]),
  );

  const invalidateSalesQueues = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: orderQueryKeys.salesActionCount() });
  }, [queryClient]);

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
    optimisticStatus: string;
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
      await invalidateSalesQueues();
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

  const orders = salesQuery.data?.orders ?? [];

  const emptyMessage = hasSearchQuery
    ? MY_SALES_PAGE_UI.EMPTY_BY_SEARCH
    : statusFilter
      ? MY_SALES_PAGE_UI.EMPTY_BY_FILTER
      : MY_SALES_PAGE_UI.EMPTY;

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_MY_SALES}
        onPress={() => setNavSheetVisible(true)}
      />
      <MySalesPageToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        isSearchPending={isSearchPending}
        ordersCount={orders.length}
        totalSalesCount={sellerTotalSalesCount}
      />
      {orders.length === 0 ? (
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
        data={orders}
        keyExtractor={(order) => order._id}
        contentContainerStyle={[styles.list, { paddingBottom: contentPaddingBottom }]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={salesQuery.isRefetching}
            onRefresh={() => salesQuery.refetch()}
          />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            compact
            showBuyer
            onBuyerNameClick={handleBuyerNameClick}
            onProductClick={handleProductClick}
            onMarkShipped={handleMarkShipped}
            onMarkDelivered={handleMarkDelivered}
            onCancelItem={handleCancelItem}
            pendingActionKey={pendingActionKey}
            itemActionErrors={itemActionErrors}
          />
        )}
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
