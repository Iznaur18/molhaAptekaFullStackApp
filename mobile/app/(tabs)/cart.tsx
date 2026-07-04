import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

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
import { CheckoutSheetModal } from "@/features/checkout/ui/CheckoutSheetModal";
import { orderQueryKeys } from "@/shared/api";
import { API_CLIENT_UI, AUTH_UI, CART_PAGE_UI, CHECKOUT_FORM_UI } from "@/shared/config";
import { formatApiErrorMessage, formatPriceRub } from "@/shared/lib";
import { useCartScreenStyles } from "@/shared/theme/catalogProductStyles";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { AppButton } from "@/shared/ui/AppButton";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function CartScreen() {
  const router = useRouter();
  const styles = useCartScreenStyles();
  const { contentPaddingTop, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const cartQuery = useMyCartQuery();
  const { clearCart, isUpdating } = useCartActions();
  const createOrderMutation = useCreateOrderMutation();

  const [checkoutSheetOpen, setCheckoutSheetOpen] = useState(false);
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

  const visibleLines = useMemo(
    () =>
      lines.filter(
        (line) => getCartLineExclusionReason(line, currentUserId) == null,
      ),
    [lines, currentUserId],
  );

  const checkoutSummary = useMemo(
    () => selectCartCheckoutSummary(lines, currentUserId),
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
      setCheckoutSheetOpen(false);
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

  const totalLabel = checkoutSummary.hasExcludedLines
    ? CART_PAGE_UI.PURCHASABLE_TOTAL_LABEL
    : CART_PAGE_UI.TOTAL_LABEL;

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{CART_PAGE_UI.AUTH_REQUIRED}</Text>
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="primary"
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

  if (visibleLines.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{CART_PAGE_UI.CHECKOUT_BLOCKED_ALL_UNAVAILABLE}</Text>
        <AppButton
          label={CART_PAGE_UI.CLEAR_ALL}
          variant="contrast"
          onPress={() => clearCart()}
          disabled={isUpdating}
        />
      </View>
    );
  }

  const listFooter = (
    <View style={styles.footer}>
      <View style={styles.footerTopRow}>
        <View style={styles.footerTotalBlock}>
          <Text style={styles.footerTotalLabel}>{totalLabel}</Text>
          <Text style={styles.footerTotalValue} numberOfLines={1}>
            {formatPriceRub(checkoutSummary.displayTotal)}
          </Text>
          {checkoutSummary.hasExcludedLines ? (
            <Text style={styles.footerFullTotalHint} numberOfLines={1}>
              {formatPriceRub(checkoutSummary.fullTotal)}
            </Text>
          ) : null}
        </View>
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

      <AppButton
        label={CART_PAGE_UI.CHECKOUT_OPEN}
        variant="primary"
        style={styles.footerCheckoutButton}
        disabled={!canCheckout || isUpdating}
        onPress={() => setCheckoutSheetOpen(true)}
      />
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.container}
        data={visibleLines}
        keyExtractor={(line) => line.productId}
        renderItem={({ item }) => <CartLineItem line={item} />}
        contentContainerStyle={[
          styles.list,
          { paddingTop: contentPaddingTop + 8, paddingBottom: contentPaddingBottom },
        ]}
        ListFooterComponent={listFooter}
        refreshControl={
          <ThemedRefreshControl
            refreshing={cartQuery.isRefetching || productsQuery.isRefetching}
            onRefresh={handleRefresh}
          />
        }
      />

      <CheckoutSheetModal
        visible={checkoutSheetOpen}
        defaultUser={sessionQuery.data?.user}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        isDisabled={!canCheckout}
        onClose={() => setCheckoutSheetOpen(false)}
        onSubmit={handleCheckoutSubmit}
      />
    </>
  );
}
