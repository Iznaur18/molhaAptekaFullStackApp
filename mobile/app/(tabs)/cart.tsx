import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ORDER_FULFILLMENT_DELIVERY,
  doProductsSupportPickup,
  doProductsSupportSellerDelivery,
} from "@molha/api-contract";
import {
  groupCartLinesBySeller,
  hasMixedDeliveryCarriers,
  isProductBuyNFreeActive,
  resolveCartAllowedPaymentMethods,
  resolveCartFulfillmentBySeller,
  resolveCartSellerDelivery,
  isCardOnDeliveryAccepted,
  type CdekOrderSelection,
  type YandexDeliveryOrderSelection,
} from "@izibuy/shared-lib";

import { buildCheckoutPickupGroups } from "@/entities/cart/lib/buildCheckoutPickupLocations";
import { getCartLineExclusionReason } from "@/entities/cart/lib/getCartLineExclusionReason";
import { resolveCheckoutSellers } from "@/entities/cart/lib/resolveCheckoutSellers";
import { useCdekAvailabilityQuery } from "@/entities/cdek/model/useCdekAvailabilityQuery";
import { useYandexDeliveryAvailabilityQuery } from "@/entities/yandex-delivery/model/useYandexDeliveryAvailabilityQuery";
import {
  CartSellerList,
  type CartSellerEntry,
} from "@/entities/cart/ui/CartSellerList";
import { useCardPrepaidAvailable } from "@/entities/payment/model/usePaymentConfigQuery";
import { selectCartCheckoutSummary } from "@/entities/cart/lib/selectCartCheckoutSummary";
import { selectCartLines } from "@/entities/cart/lib/selectCartLines";
import { useCartFlashSalePriceTick } from "@/entities/cart/model/useCartFlashSalePriceTick";
import { useCartActions } from "@/entities/cart/model/useCartActions";
import { useCartProductsQuery } from "@/entities/cart/model/useCartProductsQuery";
import { useCartSelection } from "@/entities/cart/model/useCartSelection";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useMyCartQuery } from "@/entities/cart/model/useMyCartQuery";
import {
  CartCheckoutDock,
  CartFulfillmentSection,
} from "@/entities/cart/ui/CartFulfillmentSection";
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
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
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
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  useCartFulfillmentSectionStyles,
  useCartSellerListStyles,
} from "@/shared/theme/cartFulfillmentStyles";
import { useCartScreenStyles } from "@/shared/theme/catalogProductStyles";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { AppButton } from "@/shared/ui/AppButton";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function CartScreen() {
  const router = useRouter();
  const styles = useCartScreenStyles();
  const sellerListStyles = useCartSellerListStyles();
  const fulfillmentStyles = useCartFulfillmentSectionStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { contentPaddingTop, centeredContentStyle } = useScreenLayout();
  const bottomNavLayoutHeight = resolveMobileBottomNavLayoutHeight(insets.bottom);
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const cartQuery = useMyCartQuery();
  const { clearCart, removeItems, isUpdating } = useCartActions();
  const createOrderMutation = useCreateOrderMutation();

  /** Открытая корзина продавца; null — общий список продавцов. */
  const [activeSellerCartId, setActiveSellerCartId] = useState<string | null>(null);
  /** Выбор покупателя по продавцам; пусто = способ по умолчанию у отправления. */
  const [chosenFulfillmentBySeller, setChosenFulfillmentBySeller] = useState<
    Record<string, OrderFulfillmentMethod>
  >({});
  const [auctionCheckoutBid, setAuctionCheckoutBid] = useState<MyPriceOfferBid | null>(
    null,
  );
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
  const auctionBids = useMemo(
    () => acceptedBidsQuery.data ?? [],
    [acceptedBidsQuery.data],
  );
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
      lines.filter((line) => getCartLineExclusionReason(line, currentUserId) == null),
    [lines, currentUserId],
  );

  // Корзина делится на отправления — по одному на продавца. Способ получения
  // покупатель выбирает у каждого: раньше его выбирала сама корзина, и товар
  // с обоими способами всегда уезжал в самовывоз.
  const sellerGroups = useMemo(
    () => groupCartLinesBySeller(visibleLines),
    [visibleLines],
  );

  const purchasableIds = useMemo(
    () => visibleLines.map((line) => line.productId),
    [visibleLines],
  );

  const {
    deselectedIds,
    isLineSelected,
    toggleLine,
    toggleAllIn,
    areAllSelectedIn,
    selectedCountIn,
  } = useCartSelection(purchasableIds);

  /** Свод на каждое отправление — у продавца свои итоги и галочки. */
  const sellerEntries = useMemo<CartSellerEntry[]>(
    () =>
      sellerGroups.map((group) => ({
        group,
        summary: selectCartCheckoutSummary(group.lines, currentUserId, deselectedIds),
        productIds: group.lines.map((line) => line.productId),
      })),
    [sellerGroups, currentUserId, deselectedIds],
  );

  /**
   * Итоговый выбор способов. Считается от групп, а не от состояния:
   * сохранённый выбор мог стать недоступным, если покупатель убрал товар,
   * который его разрешал.
   */
  const fulfillmentBySellerId = useMemo(
    () => resolveCartFulfillmentBySeller(sellerGroups, chosenFulfillmentBySeller),
    [sellerGroups, chosenFulfillmentBySeller],
  );

  // Продавец исчез из корзины (товары убрали или заказали) — назад к списку.
  useEffect(() => {
    if (
      activeSellerCartId != null &&
      !sellerGroups.some((group) => group.cartGroupId === activeSellerCartId)
    ) {
      setActiveSellerCartId(null);
    }
  }, [activeSellerCartId, sellerGroups]);

  const activeSellerEntry = useMemo(
    () =>
      activeSellerCartId == null
        ? null
        : (sellerEntries.find(
            (entry) => entry.group.cartGroupId === activeSellerCartId,
          ) ?? null),
    [activeSellerCartId, sellerEntries],
  );

  const emptySummary = useMemo(
    () => selectCartCheckoutSummary([], currentUserId, deselectedIds),
    [currentUserId, deselectedIds],
  );
  const activeSummary = activeSellerEntry?.summary ?? emptySummary;
  /** Группа товаров за баллы: итог в баллах, без предоплаты. */
  const isPointsCheckout =
    auctionCheckoutBid == null &&
    activeSellerEntry?.group.paidWithLoyaltyPoints === true;

  /** Отмеченные товары везут разные службы — одной доставкой не оформить. */
  const checkoutMixedCarriers = useMemo(
    () =>
      hasMixedDeliveryCarriers(activeSummary.selectedLines.map((line) => line.product)),
    [activeSummary.selectedLines],
  );

  const canCheckoutActive =
    activeSummary.selectedLines.length > 0 && !activeSummary.checkoutBlockReason;

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
        product as
          | {
              productPickupEnabled?: boolean | null;
              productPickupAddress?: string | null;
            }
          | undefined,
      ]);
    }
    return doProductsSupportPickup(
      activeSummary.selectedLines.map((line) => line.product),
    );
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.products]);

  // Покупатель видит только то, что принимают продавцы оформляемых товаров:
  // способ, которого у продавца нет, сервер отклонит.
  const checkoutSellers = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.products ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return resolveCheckoutSellers([product]);
    }
    return resolveCheckoutSellers(
      activeSummary.selectedLines.map((line) => line.product),
    );
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.products]);
  const allowedPaymentMethods = useMemo(
    () => resolveCartAllowedPaymentMethods(checkoutSellers),
    [checkoutSellers],
  );
  const checkoutSellerIds = useMemo(
    () => checkoutSellers.map((seller) => seller.sellerId),
    [checkoutSellers],
  );
  const cardPrepaidAvailableForSellers = useCardPrepaidAvailable({
    sellerIds: checkoutSellerIds,
    enabled: isAuthorized,
  });
  // Заказ за баллы предоплатой не оформляется: рублями там только доставка,
  // и платят её при получении (сервер предоплату отклонит).
  const cardPrepaidAvailable = cardPrepaidAvailableForSellers && !isPointsCheckout;

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      cartQuery.refetch(),
      productsQuery.refetch(),
      acceptedBidsQuery.refetch(),
    ]);
  }, [acceptedBidsQuery, cartQuery, productsQuery]);

  // СДЭК предлагаем, только если продавец подключил свой договор. На
  // аукционном оформлении его нет — как и на сайте.
  const cdekSellerId = activeSellerEntry?.group.sellerId ?? "";
  const cdekAvailabilityQuery = useCdekAvailabilityQuery(cdekSellerId, {
    enabled: isAuthorized,
  });
  const cdekAvailable = cdekAvailabilityQuery.data === true && !auctionCheckoutBid;
  const sessionUser = sessionQuery.data?.user;
  const cdekConfig = useMemo(
    () =>
      cdekAvailable && cdekSellerId
        ? {
            sellerId: cdekSellerId,
            productIds: activeSummary.selectedLines.map((line) => line.productId),
            recipientName: String(sessionUser?.userFullName ?? ""),
            recipientPhone: String(sessionUser?.userPhoneNumber ?? ""),
          }
        : null,
    [
      cdekAvailable,
      cdekSellerId,
      activeSummary.selectedLines,
      sessionUser?.userFullName,
      sessionUser?.userPhoneNumber,
    ],
  );

  // Яндекс Доставка — так же по договору продавца. Платят с ней только
  // картой в пункте, поэтому без «картой при получении» у продавца её не
  // предлагаем: заказ всё равно не оформить.
  const yandexAvailabilityQuery = useYandexDeliveryAvailabilityQuery(cdekSellerId, {
    enabled: isAuthorized,
  });
  const yandexAvailable =
    yandexAvailabilityQuery.data?.available === true &&
    !auctionCheckoutBid &&
    isCardOnDeliveryAccepted(allowedPaymentMethods);
  const yandexConfig = useMemo(
    () =>
      yandexAvailable && cdekSellerId
        ? {
            sellerId: cdekSellerId,
            items: activeSummary.selectedLines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
            })),
            recipientName: String(sessionUser?.userFullName ?? ""),
            recipientPhone: String(sessionUser?.userPhoneNumber ?? ""),
          }
        : null,
    [
      yandexAvailable,
      cdekSellerId,
      activeSummary.selectedLines,
      sessionUser?.userFullName,
      sessionUser?.userPhoneNumber,
    ],
  );

  // «Экспресс» — курьер Яндекса до двери. Тоже только картой при получении.
  const expressAvailable =
    yandexAvailabilityQuery.data?.expressAvailable === true &&
    !auctionCheckoutBid &&
    isCardOnDeliveryAccepted(allowedPaymentMethods);
  const expressConfig = useMemo(
    () =>
      expressAvailable && cdekSellerId
        ? {
            items: activeSummary.selectedLines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
            })),
            recipientName: String(sessionUser?.userFullName ?? ""),
            recipientPhone: String(sessionUser?.userPhoneNumber ?? ""),
          }
        : null,
    [
      expressAvailable,
      cdekSellerId,
      activeSummary.selectedLines,
      sessionUser?.userFullName,
      sessionUser?.userPhoneNumber,
    ],
  );
  // Служба, заданная продавцом на товаре (ЛОБО): ей подписана «своя доставка».
  const checkoutProductCarrier = activeSellerEntry?.group.deliveryCarrier ?? null;

  // Тариф собственной доставки продавца. Считаем так, будто выбрана доставка:
  // блок с ценой форма показывает только в этом режиме. Сумму собирает функция
  // контракта, расстояние по дорогам приходит котировкой с сервера.
  const sellerDelivery = useMemo(() => {
    if (auctionCheckoutBid || !activeSellerEntry || checkoutMixedCarriers) {
      return null;
    }
    const sellerId = activeSellerEntry.group.sellerId;
    return resolveCartSellerDelivery({
      sellerGroups: [{ sellerId, lines: activeSummary.selectedLines }],
      fulfillmentBySellerId: { [sellerId]: ORDER_FULFILLMENT_DELIVERY },
      goodsTotalRub: activeSummary.selectedTotal,
    });
  }, [
    auctionCheckoutBid,
    activeSellerEntry,
    checkoutMixedCarriers,
    activeSummary.selectedLines,
    activeSummary.selectedTotal,
  ]);
  const deliveryProductIds = useMemo(
    () => activeSummary.selectedLines.map((line) => line.productId),
    [activeSummary.selectedLines],
  );

  const handleOpenAuctionCheckout = (bid: MyPriceOfferBid) => {
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setAuctionCheckoutBid(bid);
  };

  /** Ключ группы: у продавца их две, если в корзине есть его товары за баллы. */
  const openSellerCart = (cartGroupId: string) => {
    setAuctionCheckoutBid(null);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setActiveSellerCartId(cartGroupId);
  };

  const closeSellerCart = () => {
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setActiveSellerCartId(null);
  };

  const handleSellerFulfillmentChange = useCallback(
    (method: OrderFulfillmentMethod) => {
      if (activeSellerCartId == null) return;
      setChosenFulfillmentBySeller((prev) =>
        prev[activeSellerCartId] === method
          ? prev
          : { ...prev, [activeSellerCartId]: method },
      );
    },
    [activeSellerCartId],
  );

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
      setSubmitState({
        isSubmitting: false,
        error: "",
        success: CART_AUCTION_UI.ORDER_PLACED,
      });
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
    cdekShipment?: CdekOrderSelection;
    yandexDeliveryShipment?: YandexDeliveryOrderSelection;
    yandexExpressShipment?: { recipient: { name: string; phone: string } };
    deliveryAddressGeo?: { lat: number; lon: number } | null;
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
        // Заказ оформляется у одного продавца: способ получения — его
        // отправления, а не всего заказа «по умолчанию».
        ...(activeSellerCartId
          ? {
              fulfillmentBySellerId: {
                [activeSellerCartId]: payload.fulfillmentMethod,
              },
            }
          : {}),
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
        pickupSelections: payload.pickupSelections,
        // СДЭК везёт по договору продавца: адрес сервер возьмёт из пункта.
        ...(payload.cdekShipment ? { cdekShipment: payload.cdekShipment } : {}),
        ...(payload.yandexDeliveryShipment
          ? { yandexDeliveryShipment: payload.yandexDeliveryShipment }
          : {}),
        ...(payload.yandexExpressShipment
          ? { yandexExpressShipment: payload.yandexExpressShipment }
          : {}),
        // Точка адреса — как сайт: курьер едет к подъезду, а не к середине улицы.
        ...(payload.deliveryAddressGeo
          ? { deliveryAddressGeo: payload.deliveryAddressGeo }
          : {}),
      });
      await removeItems(orderedProductIds);
      setActiveSellerCartId(null);
      await Promise.all([
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
        message={formatApiErrorMessage(
          cartQuery.error,
          API_CLIENT_UI.FETCH_CART_FALLBACK,
        )}
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
        <Text style={styles.message}>
          {CART_PAGE_UI.CHECKOUT_BLOCKED_ALL_UNAVAILABLE}
        </Text>
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
          // Форма оформления стоит на странице: тап по кнопке не должен
          // уходить на закрытие клавиатуры, поле — не прятаться под ней.
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
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
          {activeSellerEntry ? (
            <>
              <Pressable
                style={sellerListStyles.backRow}
                onPress={closeSellerCart}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Feather name="chevron-left" size={18} color={theme.colors.text} />
                <Text style={sellerListStyles.backText}>
                  {CART_PAGE_UI.BACK_TO_SELLERS}
                </Text>
              </Pressable>

              <CartFulfillmentSection
                key={activeSellerEntry.group.cartGroupId || "unknown-seller"}
                title={
                  activeSellerEntry.group.paidWithLoyaltyPoints
                    ? `${
                        activeSellerEntry.group.sellerName.trim() ||
                        CART_PAGE_UI.SECTION_SELLER_FALLBACK
                      } · ${CART_PAGE_UI.POINTS_GROUP_SUFFIX}`
                    : activeSellerEntry.group.sellerName.trim() ||
                      CART_PAGE_UI.SECTION_SELLER_FALLBACK
                }
                note={checkoutMixedCarriers ? CART_PAGE_UI.MIXED_CARRIERS_NOTE : null}
                lines={activeSellerEntry.group.lines}
                selectedCount={selectedCountIn(activeSellerEntry.productIds)}
                areAllSelected={areAllSelectedIn(activeSellerEntry.productIds)}
                onToggleAll={() => toggleAllIn(activeSellerEntry.productIds)}
                isLineSelected={isLineSelected}
                onToggleSelected={toggleLine}
              >
                {/* Оформление прямо на странице, как на сайте: способ получения,
                    адрес, оплата, итог и «Оформить». */}
                <View style={fulfillmentStyles.checkoutForm}>
                  <CheckoutForm
                    key={sessionUser?._id != null ? String(sessionUser._id) : "guest"}
                    defaultUser={sessionUser}
                    pickupGroups={pickupGroups}
                    // «Доставка» доступна и тогда, когда у продавца есть только СДЭК.
                    deliveryAvailable={
                      deliveryAvailable ||
                      cdekAvailable ||
                      yandexAvailable ||
                      expressAvailable
                    }
                    pickupAvailable={pickupAvailable}
                    allowedPaymentMethods={allowedPaymentMethods}
                    cardPrepaidAvailable={cardPrepaidAvailable}
                    paidWithLoyaltyPoints={isPointsCheckout}
                    sellerDeliveryAvailable={deliveryAvailable}
                    cdek={cdekConfig}
                    yandex={yandexConfig}
                    express={expressConfig}
                    productCarrier={checkoutProductCarrier}
                    sellerDelivery={sellerDelivery}
                    deliveryProductIds={deliveryProductIds}
                    initialFulfillmentMethod={
                      fulfillmentBySellerId[activeSellerEntry.group.sellerId] ?? null
                    }
                    onFulfillmentMethodChange={handleSellerFulfillmentChange}
                    isSubmitting={submitState.isSubmitting}
                    submitError={submitState.error}
                    submitSuccess={submitState.success}
                    isDisabled={!canCheckoutActive}
                    showHeading={false}
                    fieldsStyle={fulfillmentStyles.checkoutFormFields}
                    onSubmit={handleCheckoutSubmit}
                    renderFooter={(footer) => (
                      <CartCheckoutDock
                        summary={activeSellerEntry.summary}
                        pointsTotal={
                          isPointsCheckout
                            ? activeSellerEntry.summary.selectedPointsTotal
                            : null
                        }
                        canCheckout={canCheckoutActive}
                        deliveryCost={footer.deliveryCost}
                        error={footer.error}
                        success={footer.success}
                        isSubmitting={footer.isSubmitting}
                        submitDisabled={footer.submitDisabled || isUpdating}
                        onSubmit={footer.submit}
                      />
                    )}
                  />
                </View>
              </CartFulfillmentSection>
            </>
          ) : (
            <>
              <CartAuctionSection
                bids={auctionBids}
                onCheckout={handleOpenAuctionCheckout}
              />

              <CartSellerList entries={sellerEntries} onOpenSeller={openSellerCart} />
            </>
          )}
        </ScrollView>
      </View>

      <CheckoutSheetModal
        visible={auctionCheckoutBid != null}
        defaultUser={sessionQuery.data?.user}
        pickupGroups={pickupGroups}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
        allowedPaymentMethods={allowedPaymentMethods}
        cardPrepaidAvailable={cardPrepaidAvailable}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        onClose={() => setAuctionCheckoutBid(null)}
        onSubmit={handleAuctionCheckoutSubmit}
      />
    </View>
  );
}
