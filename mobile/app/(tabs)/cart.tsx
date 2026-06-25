import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { getCartLineExclusionReason } from "@/entities/cart/lib/getCartLineExclusionReason";
import { selectCartCheckoutSummary } from "@/entities/cart/lib/selectCartCheckoutSummary";
import { selectCartLines } from "@/entities/cart/lib/selectCartLines";
import { useCartActions } from "@/entities/cart/model/useCartActions";
import { useCartProductsQuery } from "@/entities/cart/model/useCartProductsQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useMyCartQuery } from "@/entities/cart/model/useMyCartQuery";
import { CartLineItem } from "@/entities/cart/ui/CartLineItem";
import type { OrderPaymentMethod } from "@/entities/order/model/constants";
import { useCreateOrderMutation } from "@/entities/order/model/useCreateOrderMutation";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import { orderQueryKeys } from "@/shared/api";
import { API_CLIENT_UI, AUTH_UI, CART_PAGE_UI, CHECKOUT_FORM_UI } from "@/shared/config";
import { formatApiErrorMessage, formatPriceRub } from "@/shared/lib";
import { useCartScreenStyles } from "@/shared/theme/catalogProductStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function CartScreen() {
  const router = useRouter();
  const styles = useCartScreenStyles();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const cartQuery = useMyCartQuery();
  const { clearCart, isUpdating } = useCartActions();
  const createOrderMutation = useCreateOrderMutation();

  const [submitState, setSubmitState] = useState({
    isSubmitting: false,
    error: "",
    success: "",
  });

  const productIds = useMemo(() => Object.keys(cartQuery.data ?? {}), [cartQuery.data]);
  const productsQuery = useCartProductsQuery(productIds);
  const currentUserId = sessionQuery.data?.user?._id;

  const { lines } = useMemo(
    () => selectCartLines(cartQuery.data ?? {}, productsQuery.products),
    [cartQuery.data, productsQuery.products],
  );

  const checkoutSummary = useMemo(
    () => selectCartCheckoutSummary(lines, currentUserId),
    [lines, currentUserId],
  );

  const lineExclusionByProductId = useMemo(
    () =>
      new Map(
        lines.map((line) => [
          line.productId,
          getCartLineExclusionReason(line, currentUserId),
        ]),
      ),
    [lines, currentUserId],
  );

  const canCheckout = checkoutSummary.purchasableLines.length > 0;

  const handleRefresh = useCallback(async () => {
    await Promise.all([cartQuery.refetch(), productsQuery.refetch()]);
  }, [cartQuery, productsQuery]);

  const handleCheckoutSubmit = async (payload: {
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  }) => {
    setSubmitState({ isSubmitting: true, error: "", success: "" });
    try {
      await createOrderMutation.mutateAsync({
        items: checkoutSummary.purchasableLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
      });
      await clearCart();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.my() }),
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.myActionCount() }),
      ]);
      router.replace("/orders");
    } catch (error) {
      setSubmitState({
        isSubmitting: false,
        error:
          error instanceof Error ? error.message : CHECKOUT_FORM_UI.ERROR_GENERIC,
        success: "",
      });
    }
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{CART_PAGE_UI.AUTH_REQUIRED}</Text>
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="contrast"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    );
  }

  if (cartQuery.isPending || productsQuery.isPending) {
    return <ScreenLoadingState message={CART_PAGE_UI.LOADING} />;
  }

  if (cartQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(cartQuery.error, API_CLIENT_UI.FETCH_CART_FALLBACK)}
        onRetry={() => cartQuery.refetch()}
      />
    );
  }

  if (productsQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          productsQuery.error,
          CART_PAGE_UI.PRODUCTS_LOAD_ERROR,
        )}
        onRetry={() => productsQuery.refetch()}
      />
    );
  }

  if (lines.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{CART_PAGE_UI.EMPTY}</Text>
        <AppButton
          label={CART_PAGE_UI.GO_TO_CATALOG}
          variant="contrast"
          onPress={() => router.push("/(tabs)")}
        />
      </View>
    );
  }

  const totalLabel = checkoutSummary.hasExcludedLines
    ? CART_PAGE_UI.PURCHASABLE_TOTAL_LABEL
    : CART_PAGE_UI.TOTAL_LABEL;

  const listFooter = (
    <View style={styles.footer}>
      <View style={styles.summaryCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
          <Text style={styles.totalValue}>{formatPriceRub(checkoutSummary.displayTotal)}</Text>
        </View>

        {checkoutSummary.hasExcludedLines ? (
          <Text style={styles.fullTotalHint}>
            {formatPriceRub(checkoutSummary.fullTotal)}
          </Text>
        ) : null}

        <Pressable
          style={[styles.clearButton, isUpdating && styles.buttonDisabled]}
          onPress={() => clearCart()}
          disabled={isUpdating}
        >
          <Text style={styles.clearButtonText}>{CART_PAGE_UI.CLEAR_ALL}</Text>
        </Pressable>
      </View>

      {!canCheckout && checkoutSummary.checkoutBlockReason ? (
        <Text style={styles.checkoutHint}>{checkoutSummary.checkoutBlockReason}</Text>
      ) : null}

      <CheckoutForm
        key={currentUserId ?? "guest"}
        defaultUser={sessionQuery.data?.user}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        isDisabled={!canCheckout}
        onSubmit={handleCheckoutSubmit}
      />
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={lines}
      keyExtractor={(line) => line.productId}
      renderItem={({ item }) => (
        <CartLineItem
          line={item}
          exclusionReason={lineExclusionByProductId.get(item.productId) ?? null}
        />
      )}
      contentContainerStyle={styles.list}
      ListFooterComponent={listFooter}
      refreshControl={
        <ThemedRefreshControl
          refreshing={cartQuery.isRefetching || productsQuery.isRefetching}
          onRefresh={handleRefresh}
        />
      }
    />
  );
}
