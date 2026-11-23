import { orderFromApiSchema } from "@molha/api-contract";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import { AppState, Text, View } from "react-native";
import { AppButton } from "@/shared/ui/AppButton";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { orderMatchesMyOrdersFilters } from "@/entities/order/lib/filterMyOrders";
import { projectMyOrdersSellerBlocks } from "@/entities/order/lib/projectMyOrdersSellerBlocks";
import { resolveOrderLineProductId } from "@/entities/order/lib/resolveOrderLineProductId";
import { summarizeMyOrders } from "@/entities/order/lib/summarizeMyOrders";
import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "@/entities/order/model/myOrdersListFilters";
import { useMyOrdersQuery } from "@/entities/order/model/useMyOrdersQuery";
import { OrderCard } from "@/entities/order/ui/OrderCard";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useBuyerOrderCardActions } from "@/features/my-orders-page/model/useBuyerOrderCardActions";
import { MyOrdersPageOverview } from "@/features/my-orders-page/ui/MyOrdersPageOverview";
import { MyOrdersPageToolbar } from "@/features/my-orders-page/ui/MyOrdersPageToolbar";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountList } from "@/features/profile-tab/ui/ProfileAccountList";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import {
  API_CLIENT_UI,
  AUTH_UI,
  MY_ORDERS_PAGE_UI,
  MY_PROFILE_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useMyOrdersPageStyles } from "@/shared/theme/myOrdersPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type OrderRecord = z.infer<typeof orderFromApiSchema>;

const EMPTY_ORDERS: OrderRecord[] = [];

export const MyOrdersPage = () => {
  const router = useRouter();
  const styles = useMyOrdersPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const isAuthorized = useIsAuthorized();
  const ordersQuery = useMyOrdersQuery();
  const {
    pendingActionKey,
    itemActionErrors,
    loyaltyFlash,
    handleRefresh,
    handlePayOrder,
    handleConfirmDelivered,
    handleCancelItem,
    handleMarkReturned,
    handleCancelOrder,
  } = useBuyerOrderCardActions({
    refetchOrders: () => ordersQuery.refetch(),
  });
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void ordersQuery.refetch();
      }
    }, [isAuthorized, ordersQuery.refetch]),
  );

  useEffect(() => {
    if (!isAuthorized) {
      return undefined;
    }
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void ordersQuery.refetch();
      }
    });
    return () => subscription.remove();
  }, [isAuthorized, ordersQuery.refetch]);

  const handleInProgressFilterClick = useCallback(() => {
    setStatusFilter((current) =>
      current === MY_ORDERS_LIST_FILTER_IN_PROGRESS
        ? ""
        : MY_ORDERS_LIST_FILTER_IN_PROGRESS,
    );
    setAttentionOnly(false);
  }, []);

  const handleAttentionOnlyChange = useCallback((value: boolean) => {
    setAttentionOnly(value);
    if (value) {
      setStatusFilter("");
    }
  }, []);

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

  const handleOpenOrder = useCallback(
    (orderId: string) => {
      router.push({ pathname: "/orders/[id]", params: { id: orderId } });
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
        attentionOnly={attentionOnly}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setAttentionOnly(false);
        }}
        onAttentionOnlyChange={handleAttentionOnlyChange}
      />
      <MyOrdersPageOverview
        inProgressCount={summary.inProgressCount}
        attentionCount={summary.attentionCount}
        totalAmountRub={summary.totalAmountRub}
        attentionOnly={attentionOnly}
        onInProgressFilterClick={handleInProgressFilterClick}
        onAttentionFilterChange={handleAttentionOnlyChange}
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
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyState} accessibilityRole="text">
            {emptyMessage}
          </Text>
          {totalAll === 0 ? (
            <AppButton
              label={MY_ORDERS_PAGE_UI.EMPTY_GO_CATALOG}
              variant="primary"
              onPress={() => router.push("/(tabs)/catalog")}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{MY_ORDERS_PAGE_UI.AUTH_REQUIRED}</Text>
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
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
      <ProfileAccountList
        data={filteredBlocks}
        keyExtractor={(block) => block.blockKey}
        style={[
          styles.container,
          scrollEnabled ? styles.listFlex : null,
          scrollEnabled ? centeredContentStyle : null,
        ]}
        contentContainerStyle={[
          styles.list,
          !isDrawerLayout ? styles.listInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={ordersQuery.isRefetching}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item: block, index }) => (
          <View style={index === 0 ? styles.listItemFirst : styles.listItem}>
            <OrderCard
              order={block.order}
              style={styles.orderCardInList}
              compact
              showSeller
              onOpenOrder={handleOpenOrder}
              onSellerNameClick={handleSellerNameClick}
              onProductClick={handleProductClick}
              onConfirmDelivered={handleConfirmDelivered}
              onCancelItem={handleCancelItem}
              onMarkReturned={handleMarkReturned}
              onCancelOrder={handleCancelOrder}
              onPayOrder={handlePayOrder}
              pendingActionKey={pendingActionKey}
              itemActionErrors={itemActionErrors}
            />
          </View>
        )}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="my-orders"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
