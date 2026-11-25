import { orderFromApiSchema } from "@molha/api-contract";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import type { z } from "zod";
import { AppState, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resolveOrderLineProductId } from "@/entities/order/lib/resolveOrderLineProductId";
import { useMyOrdersQuery } from "@/entities/order/model/useMyOrdersQuery";
import { OrderCard } from "@/entities/order/ui/OrderCard";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useBuyerOrderCardActions } from "@/features/my-orders-page/model/useBuyerOrderCardActions";
import { API_CLIENT_UI, AUTH_UI, MY_ORDERS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { resolveScreenBackContentPaddingTop } from "@/shared/lib/screenBackButtonLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useMyOrdersPageStyles } from "@/shared/theme/myOrdersPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenBackButton } from "@/shared/ui/ScreenBackButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

type OrderRecord = z.infer<typeof orderFromApiSchema>;

const EMPTY_ORDERS: OrderRecord[] = [];

export const OrderDetailPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useMyOrdersPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : (id ?? "");
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

  const order = useMemo(() => {
    const orders = ordersQuery.data ?? EMPTY_ORDERS;
    return orders.find((row) => String(row._id) === orderId) ?? null;
  }, [orderId, ordersQuery.data]);

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

  const goOrdersList = useCallback(() => {
    router.replace("/orders" as never);
  }, [router]);

  const contentPaddingTop = resolveScreenBackContentPaddingTop(insets.top);

  if (!isAuthorized) {
    return (
      <View style={[styles.centered, { paddingTop: contentPaddingTop }]}>
        <ScreenBackButton onPress={goOrdersList} />
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
    return (
      <View style={styles.container}>
        <ScreenBackButton onPress={goOrdersList} />
        <ScreenLoadingState message={MY_ORDERS_PAGE_UI.DETAIL_LOADING} />
      </View>
    );
  }

  if (ordersQuery.isError) {
    return (
      <View style={styles.container}>
        <ScreenBackButton onPress={goOrdersList} />
        <ScreenErrorState
          message={formatApiErrorMessage(
            ordersQuery.error,
            API_CLIENT_UI.FETCH_MY_ORDERS_FALLBACK,
          )}
          onRetry={() => ordersQuery.refetch()}
        />
      </View>
    );
  }

  if (!orderId || !order) {
    return (
      <View style={[styles.centered, { paddingTop: contentPaddingTop }]}>
        <ScreenBackButton onPress={goOrdersList} />
        <Text style={styles.hint}>{MY_ORDERS_PAGE_UI.DETAIL_NOT_FOUND}</Text>
        <AppButton
          label={MY_ORDERS_PAGE_UI.DETAIL_BACK_TO_LIST}
          variant="primary"
          onPress={goOrdersList}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenBackButton onPress={goOrdersList} />
      <ScrollView
        style={styles.listFlex}
        contentContainerStyle={[
          styles.list,
          centeredContentStyle,
          {
            paddingTop: contentPaddingTop,
            paddingBottom: contentPaddingBottom,
            gap: 12,
          },
        ]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={ordersQuery.isRefetching}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
      >
        <Text style={styles.filterHint} accessibilityRole="header">
          {MY_ORDERS_PAGE_UI.DETAIL_TITLE}
        </Text>
        {loyaltyFlash ? (
          <Text style={styles.loyaltyFlash} accessibilityRole="text">
            {loyaltyFlash}
          </Text>
        ) : null}
        <OrderCard
          order={order}
          showSeller
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
      </ScrollView>
    </View>
  );
};
