import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { selectCartLines } from "@/entities/cart/lib/selectCartLines";
import { selectPurchasableCartLines } from "@/entities/cart/lib/selectPurchasableCartLines";
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
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function CartScreen() {
  const router = useRouter();
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

  const { lines, total } = useMemo(
    () => selectCartLines(cartQuery.data ?? {}, productsQuery.products),
    [cartQuery.data, productsQuery.products],
  );

  const purchasableLines = useMemo(
    () => selectPurchasableCartLines(lines, sessionQuery.data?.user?._id),
    [lines, sessionQuery.data?.user?._id],
  );

  const canCheckout = purchasableLines.length > 0;

  const handleCheckoutSubmit = async (payload: {
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  }) => {
    setSubmitState({ isSubmitting: true, error: "", success: "" });
    try {
      await createOrderMutation.mutateAsync({
        items: purchasableLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
      });
      await clearCart();
      void queryClient.invalidateQueries({ queryKey: orderQueryKeys.my() });
      setSubmitState({
        isSubmitting: false,
        error: "",
        success: CHECKOUT_FORM_UI.SUCCESS,
      });
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
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>{AUTH_UI.LOGIN_BUTTON}</Text>
        </Pressable>
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

  if (lines.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{CART_PAGE_UI.EMPTY}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(tabs)")}>
          <Text style={styles.buttonText}>{CART_PAGE_UI.GO_TO_CATALOG}</Text>
        </Pressable>
      </View>
    );
  }

  const listFooter = (
    <View style={styles.footer}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{CART_PAGE_UI.TOTAL_LABEL}</Text>
        <Text style={styles.totalValue}>{formatPriceRub(total)}</Text>
      </View>

      <Pressable
        style={[styles.clearButton, isUpdating && styles.buttonDisabled]}
        onPress={() => clearCart()}
        disabled={isUpdating}
      >
        <Text style={styles.clearButtonText}>{CART_PAGE_UI.CLEAR_ALL}</Text>
      </Pressable>

      <CheckoutForm
        key={sessionQuery.data?.user?._id ?? "guest"}
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
      renderItem={({ item }) => <CartLineItem line={item} />}
      contentContainerStyle={styles.list}
      ListFooterComponent={listFooter}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
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
  footer: {
    paddingTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
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
  clearButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  clearButtonText: {
    color: "#c62828",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
