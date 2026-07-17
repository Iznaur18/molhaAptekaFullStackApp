import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getCartLineExclusionReason } from "@/entities/cart/lib/getCartLineExclusionReason";
import { selectCartCheckoutSummary } from "@/entities/cart/lib/selectCartCheckoutSummary";
import { selectCartLines } from "@/entities/cart/lib/selectCartLines";
import { useCartActions } from "@/entities/cart/model/useCartActions";
import { useCartProductsQuery } from "@/entities/cart/model/useCartProductsQuery";
import { useCartSelection } from "@/entities/cart/model/useCartSelection";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useMyCartQuery } from "@/entities/cart/model/useMyCartQuery";
import { CartLineItem } from "@/entities/cart/ui/CartLineItem";
import { CartSelectAllRow } from "@/entities/cart/ui/CartSelectAllRow";
import type { OrderPaymentMethod } from "@/entities/order/model/constants";
import { useCreateOrderMutation } from "@/entities/order/model/useCreateOrderMutation";
import type { MyPriceOfferBid } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { useMyAcceptedBidsQuery } from "@/entities/product-price-offer/model/useMyAcceptedBidsQuery";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CartAuctionSection } from "@/features/cart-auction/ui/CartAuctionSection";
import { CheckoutSheetModal } from "@/features/checkout/ui/CheckoutSheetModal";
import { orderQueryKeys, priceOfferQueryKeys } from "@/shared/api";
import { API_CLIENT_UI, AUTH_UI, CART_AUCTION_UI, CART_PAGE_UI, CHECKOUT_FORM_UI } from "@/shared/config";
import { formatApiErrorMessage, formatPriceRub } from "@/shared/lib";
import { resolveMobileBottomNavLayoutHeight } from "@/shared/lib/mobileBottomNavLayout";
import { useCartScreenStyles } from "@/shared/theme/catalogProductStyles";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { AppButton } from "@/shared/ui/AppButton";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

/** Примерная высота закреплённого footer (итог + CTA). */
const CART_STICKY_FOOTER_HEIGHT = 132;

export default function CartScreen() {
  const router = useRouter();
  const styles = useCartScreenStyles();
  const insets = useSafeAreaInsets();
  const { contentPaddingTop, contentPaddingHorizontal } = useScreenLayout();
  const bottomNavLayoutHeight = resolveMobileBottomNavLayoutHeight(insets.bottom);
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const cartQuery = useMyCartQuery();
  const { clearCart, removeItems, isUpdating } = useCartActions();
  const createOrderMutation = useCreateOrderMutation();

  const [checkoutSheetOpen, setCheckoutSheetOpen] = useState(false);
  const [auctionCheckoutBid, setAuctionCheckoutBid] = useState<MyPriceOfferBid | null>(null);
  const [submitState, setSubmitState] = useState({
    isSubmitting: false,
    error: "",
    success: "",
  });

  const productIds = useMemo(() => Object.keys(cartQuery.data ?? {}), [cartQuery.data]);
  const productsQuery = useCartProductsQuery(productIds);
  const acceptedBidsQuery = useMyAcceptedBidsQuery(isAuthorized);
  const auctionBids = useMemo(() => acceptedBidsQuery.data ?? [], [acceptedBidsQuery.data]);
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

  const purchasableIds = useMemo(
    () => visibleLines.map((line) => line.productId),
    [visibleLines],
  );
  const { deselectedIds, isLineSelected, toggleLine, toggleAll, areAllSelected, selectedCount } =
    useCartSelection(purchasableIds);

  const checkoutSummary = useMemo(
    () => selectCartCheckoutSummary(lines, currentUserId, deselectedIds),
    [lines, currentUserId, deselectedIds],
  );

  const canCheckout = checkoutSummary.selectedLines.length > 0;

  const handleRefresh = useCallback(async () => {
    await Promise.all([cartQuery.refetch(), productsQuery.refetch(), acceptedBidsQuery.refetch()]);
  }, [acceptedBidsQuery, cartQuery, productsQuery]);

  const handleOpenAuctionCheckout = (bid: MyPriceOfferBid) => {
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setAuctionCheckoutBid(bid);
  };

  const handleAuctionCheckoutSubmit = async (payload: {
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  }) => {
    if (!auctionCheckoutBid) {
      return;
    }
    setSubmitState({ isSubmitting: true, error: "", success: "" });
    try {
      await createOrderMutation.mutateAsync({
        items: [{ productId: auctionCheckoutBid.productId, quantity: 1 }],
        priceOfferId: auctionCheckoutBid._id,
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
      });
      setAuctionCheckoutBid(null);
      setSubmitState({ isSubmitting: false, error: "", success: CART_AUCTION_UI.ORDER_PLACED });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: priceOfferQueryKeys.myBids() }),
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.my() }),
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.myActionCount() }),
      ]);
      router.replace("/orders");
    } catch (error) {
      setSubmitState({
        isSubmitting: false,
        error: error instanceof Error ? error.message : CHECKOUT_FORM_UI.ERROR_GENERIC,
        success: "",
      });
    }
  };

  const handleCheckoutSubmit = async (payload: {
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  }) => {
    setSubmitState({ isSubmitting: true, error: "", success: "" });
    const orderedProductIds = checkoutSummary.selectedLines.map((line) => line.productId);
    try {
      await createOrderMutation.mutateAsync({
        items: checkoutSummary.selectedLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
      });
      // Невыбранные строки остаются в корзине.
      await removeItems(orderedProductIds);
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

  const totalLabel = checkoutSummary.hasPartialSelection
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

  if (lines.length === 0 && auctionBids.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{CART_PAGE_UI.EMPTY}</Text>
        <AppButton
          label={CART_PAGE_UI.GO_TO_CATALOG}
          variant="primary"
          onPress={() => router.push("/(tabs)")}
        />
      </View>
    );
  }

  if (visibleLines.length === 0 && auctionBids.length === 0) {
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

  const stickyFooterStyle = {
    bottom: 0,
    paddingHorizontal: contentPaddingHorizontal,
    paddingBottom: 0,
  };

  const checkoutFooter = (
    <View style={[styles.stickyFooter, stickyFooterStyle]}>
      <View style={styles.footerTopRow}>
        <View style={styles.footerTotalBlock}>
          <Text style={styles.footerTotalLabel}>{totalLabel}</Text>
          <Text style={styles.footerTotalValue} numberOfLines={1}>
            {formatPriceRub(checkoutSummary.selectedTotal)}
          </Text>
          {checkoutSummary.hasPartialSelection ? (
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
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        data={visibleLines}
        keyExtractor={(line) => line.productId}
        renderItem={({ item }) => (
          <CartLineItem
            line={item}
            selected={isLineSelected(item.productId)}
            onToggleSelected={toggleLine}
          />
        )}
        ListHeaderComponent={
          <>
            <CartAuctionSection bids={auctionBids} onCheckout={handleOpenAuctionCheckout} />
            {visibleLines.length > 0 ? (
              <CartSelectAllRow
                selectedCount={selectedCount}
                totalCount={visibleLines.length}
                areAllSelected={areAllSelected}
                onToggleAll={toggleAll}
              />
            ) : null}
          </>
        }
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: contentPaddingTop + 8,
            paddingBottom:
              bottomNavLayoutHeight +
              (visibleLines.length > 0 ? CART_STICKY_FOOTER_HEIGHT : 0),
          },
        ]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={
              cartQuery.isRefetching ||
              productsQuery.isRefetching ||
              acceptedBidsQuery.isRefetching
            }
            onRefresh={handleRefresh}
          />
        }
      />

      {visibleLines.length > 0 ? checkoutFooter : null}

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

      <CheckoutSheetModal
        visible={auctionCheckoutBid != null}
        defaultUser={sessionQuery.data?.user}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        onClose={() => setAuctionCheckoutBid(null)}
        onSubmit={handleAuctionCheckoutSubmit}
      />
    </View>
  );
}
