import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CART_FULFILLMENT_SECTION_DELIVERY,
  CART_FULFILLMENT_SECTION_PICKUP,
  doProductsSupportPickup,
  doProductsSupportSellerDelivery,
} from "@molha/api-contract";
import { isProductBuyNFreeActive } from "@izibuy/shared-lib";

import { buildCheckoutPickupGroups } from "@/entities/cart/lib/buildCheckoutPickupLocations";
import { getCartLineExclusionReason } from "@/entities/cart/lib/getCartLineExclusionReason";
import { groupCartLinesByFulfillment } from "@/entities/cart/lib/groupCartLinesByFulfillment";
import { selectCartCheckoutSummary } from "@/entities/cart/lib/selectCartCheckoutSummary";
import { selectCartLines } from "@/entities/cart/lib/selectCartLines";
import { useCartFlashSalePriceTick } from "@/entities/cart/model/useCartFlashSalePriceTick";
import { useCartActions } from "@/entities/cart/model/useCartActions";
import { useCartProductsQuery } from "@/entities/cart/model/useCartProductsQuery";
import { useCartSelection } from "@/entities/cart/model/useCartSelection";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useMyCartQuery } from "@/entities/cart/model/useMyCartQuery";
import { CartFulfillmentSection } from "@/entities/cart/ui/CartFulfillmentSection";
import type { OrderFulfillmentMethod } from "@/entities/order/api/createOrder";
import type { OrderPaymentMethod } from "@/entities/order/model/constants";
import { useCreateOrderMutation } from "@/entities/order/model/useCreateOrderMutation";
import { fetchMyProductBuyNFreeProgress } from "@/entities/product/api/fetchMyProductBuyNFreeProgress";
import { fetchMyAppliedProductPromos } from "@/entities/product-promo-code/api/productPromoCodeApi";
import { productPromoCodeQueryKeys } from "@/entities/product-promo-code/model/productPromoCodeQueryKeys";
import type { MyPriceOfferBid } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { useMyAcceptedBidsQuery } from "@/entities/product-price-offer/model/useMyAcceptedBidsQuery";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CartAuctionSection } from "@/features/cart-auction/ui/CartAuctionSection";
import { CheckoutSheetModal } from "@/features/checkout/ui/CheckoutSheetModal";
import { orderQueryKeys, priceOfferQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  AUTH_UI,
  CART_AUCTION_UI,
  CART_PAGE_UI,
  CHECKOUT_FORM_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { resolveMobileBottomNavLayoutHeight } from "@/shared/lib/mobileBottomNavLayout";
import { useCartScreenStyles } from "@/shared/theme/catalogProductStyles";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { AppButton } from "@/shared/ui/AppButton";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function CartScreen() {
  const router = useRouter();
  const styles = useCartScreenStyles();
  const insets = useSafeAreaInsets();
  const { contentPaddingTop, centeredContentStyle } = useScreenLayout();
  const bottomNavLayoutHeight = resolveMobileBottomNavLayoutHeight(insets.bottom);
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const cartQuery = useMyCartQuery();
  const { clearCart, removeItems, isUpdating } = useCartActions();
  const createOrderMutation = useCreateOrderMutation();

  const [checkoutSection, setCheckoutSection] = useState<"pickup" | "delivery" | null>(
    null,
  );
  const [auctionCheckoutBid, setAuctionCheckoutBid] = useState<MyPriceOfferBid | null>(null);
  const [submitState, setSubmitState] = useState({
    isSubmitting: false,
    error: "",
    success: "",
  });

  const productIds = useMemo(() => Object.keys(cartQuery.data ?? {}), [cartQuery.data]);
  const productsQuery = useCartProductsQuery(productIds);
  const acceptedBidsQuery = useMyAcceptedBidsQuery(isAuthorized);
  const appliedPromosQuery = useQuery({
    queryKey: productPromoCodeQueryKeys.appliedMine(),
    queryFn: fetchMyAppliedProductPromos,
    enabled: isAuthorized,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const auctionBids = useMemo(() => acceptedBidsQuery.data ?? [], [acceptedBidsQuery.data]);
  const currentUserId = sessionQuery.data?.user?._id;

  const buyNFreeProductIds = useMemo(() => {
    const items = cartQuery.data ?? {};
    return productsQuery.products
      .filter((product) => {
        const active = isProductBuyNFreeActive(
          product as Parameters<typeof isProductBuyNFreeActive>[0],
        );
        return active && items[String(product._id)];
      })
      .map((product) => String(product._id));
  }, [cartQuery.data, productsQuery.products]);

  const buyNFreeProgressQueries = useQueries({
    queries: buyNFreeProductIds.map((productId) => ({
      queryKey: ["product-buy-n-free-progress", productId],
      queryFn: () => fetchMyProductBuyNFreeProgress(productId),
      enabled: isAuthorized && productId.length > 0,
      staleTime: 15_000,
    })),
  });

  const buyNFreeProgressByProductId = useMemo(() => {
    const map: Record<
      string,
      { completedPaidOrderCount?: number; freeClaimPending?: boolean }
    > = {};
    buyNFreeProductIds.forEach((productId, index) => {
      const data = buyNFreeProgressQueries[index]?.data;
      if (data) {
        map[productId] = {
          completedPaidOrderCount: data.completedPaidOrderCount,
          freeClaimPending: data.freeClaimPending,
        };
      }
    });
    return map;
  }, [buyNFreeProductIds, buyNFreeProgressQueries]);

  /** Пока в корзине есть горящая скидка — тикаем и гасим её по истечении. */
  const cartPriceNowMs = useCartFlashSalePriceTick(
    cartQuery.data ?? {},
    productsQuery.products ?? [],
  );

  const { lines } = useMemo(
    () =>
      selectCartLines(
        cartQuery.data ?? {},
        productsQuery.products,
        appliedPromosQuery.data?.appliedPromos ?? [],
        buyNFreeProgressByProductId,
        cartPriceNowMs,
      ),
    [
      cartQuery.data,
      productsQuery.products,
      appliedPromosQuery.data,
      buyNFreeProgressByProductId,
      cartPriceNowMs,
    ],
  );

  const visibleLines = useMemo(
    () =>
      lines.filter(
        (line) => getCartLineExclusionReason(line, currentUserId) == null,
      ),
    [lines, currentUserId],
  );

  const { pickupLines, deliveryLines } = useMemo(
    () => groupCartLinesByFulfillment(visibleLines),
    [visibleLines],
  );

  const purchasableIds = useMemo(
    () => visibleLines.map((line) => line.productId),
    [visibleLines],
  );
  const pickupIds = useMemo(
    () => pickupLines.map((line) => line.productId),
    [pickupLines],
  );
  const deliveryIds = useMemo(
    () => deliveryLines.map((line) => line.productId),
    [deliveryLines],
  );

  const {
    deselectedIds,
    isLineSelected,
    toggleLine,
    toggleAllIn,
    areAllSelectedIn,
    selectedCountIn,
  } = useCartSelection(purchasableIds);

  const pickupSummary = useMemo(
    () => selectCartCheckoutSummary(pickupLines, currentUserId, deselectedIds),
    [pickupLines, currentUserId, deselectedIds],
  );
  const deliverySummary = useMemo(
    () => selectCartCheckoutSummary(deliveryLines, currentUserId, deselectedIds),
    [deliveryLines, currentUserId, deselectedIds],
  );

  const activeSummary =
    checkoutSection === CART_FULFILLMENT_SECTION_DELIVERY
      ? deliverySummary
      : pickupSummary;

  const canCheckoutActive = activeSummary.selectedLines.length > 0;

  const pickupGroups = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.products ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return buildCheckoutPickupGroups([{ product }]);
    }
    return buildCheckoutPickupGroups(activeSummary.selectedLines);
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.products]);

  const deliveryAvailable = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.products ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return doProductsSupportSellerDelivery([
        product as { productDeliveryEnabled?: boolean | null } | undefined,
      ]);
    }
    return doProductsSupportSellerDelivery(
      activeSummary.selectedLines.map((line) => line.product),
    );
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.products]);

  const pickupAvailable = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.products ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return doProductsSupportPickup([
        product as {
          productPickupEnabled?: boolean | null;
          productPickupAddress?: string | null;
        } | undefined,
      ]);
    }
    return doProductsSupportPickup(
      activeSummary.selectedLines.map((line) => line.product),
    );
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.products]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([cartQuery.refetch(), productsQuery.refetch(), acceptedBidsQuery.refetch()]);
  }, [acceptedBidsQuery, cartQuery, productsQuery]);

  const handleOpenAuctionCheckout = (bid: MyPriceOfferBid) => {
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setCheckoutSection(null);
    setAuctionCheckoutBid(bid);
  };

  const openSectionCheckout = (section: "pickup" | "delivery") => {
    setAuctionCheckoutBid(null);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setCheckoutSection(section);
  };

  const handleAuctionCheckoutSubmit = async (payload: {
    fulfillmentMethod: OrderFulfillmentMethod;
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
    pickupSelections?: Array<{ productId: string; pickupLocationId: string }>;
  }) => {
    if (!auctionCheckoutBid) {
      return;
    }
    setSubmitState({ isSubmitting: true, error: "", success: "" });
    try {
      await createOrderMutation.mutateAsync({
        items: [{ productId: auctionCheckoutBid.productId, quantity: 1 }],
        priceOfferId: auctionCheckoutBid._id,
        fulfillmentMethod: payload.fulfillmentMethod,
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
        pickupSelections: payload.pickupSelections,
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
    fulfillmentMethod: OrderFulfillmentMethod;
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
    pickupSelections?: Array<{ productId: string; pickupLocationId: string }>;
  }) => {
    setSubmitState({ isSubmitting: true, error: "", success: "" });
    const orderedProductIds = activeSummary.selectedLines.map((line) => line.productId);
    try {
      await createOrderMutation.mutateAsync({
        items: activeSummary.selectedLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        fulfillmentMethod: payload.fulfillmentMethod,
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
        pickupSelections: payload.pickupSelections,
      });
      await removeItems(orderedProductIds);
      setCheckoutSection(null);
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

  return (
    <View style={styles.container}>
      <View style={[styles.container, centeredContentStyle]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.list,
            {
              paddingTop: contentPaddingTop + 8,
              paddingBottom: bottomNavLayoutHeight + 24,
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
        >
          <CartAuctionSection bids={auctionBids} onCheckout={handleOpenAuctionCheckout} />

          <CartFulfillmentSection
            title={CART_PAGE_UI.SECTION_PICKUP}
            lines={pickupLines}
            selectedCount={selectedCountIn(pickupIds)}
            areAllSelected={areAllSelectedIn(pickupIds)}
            onToggleAll={() => toggleAllIn(pickupIds)}
            isLineSelected={isLineSelected}
            onToggleSelected={toggleLine}
            summary={pickupSummary}
            canCheckout={pickupSummary.selectedLines.length > 0}
            onCheckout={() => openSectionCheckout(CART_FULFILLMENT_SECTION_PICKUP)}
            checkoutDisabled={isUpdating}
          />

          <CartFulfillmentSection
            title={CART_PAGE_UI.SECTION_DELIVERY}
            lines={deliveryLines}
            selectedCount={selectedCountIn(deliveryIds)}
            areAllSelected={areAllSelectedIn(deliveryIds)}
            onToggleAll={() => toggleAllIn(deliveryIds)}
            isLineSelected={isLineSelected}
            onToggleSelected={toggleLine}
            summary={deliverySummary}
            canCheckout={deliverySummary.selectedLines.length > 0}
            onCheckout={() => openSectionCheckout(CART_FULFILLMENT_SECTION_DELIVERY)}
            checkoutDisabled={isUpdating}
            showDeliveryFeeNote
          />
        </ScrollView>
      </View>

      <CheckoutSheetModal
        visible={checkoutSection != null}
        defaultUser={sessionQuery.data?.user}
        pickupGroups={pickupGroups}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        isDisabled={!canCheckoutActive}
        onClose={() => setCheckoutSection(null)}
        onSubmit={handleCheckoutSubmit}
      />

      <CheckoutSheetModal
        visible={auctionCheckoutBid != null}
        defaultUser={sessionQuery.data?.user}
        pickupGroups={pickupGroups}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        onClose={() => setAuctionCheckoutBid(null)}
        onSubmit={handleAuctionCheckoutSubmit}
      />
    </View>
  );
}
