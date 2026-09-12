import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  doProductsSupportPickup,
  doProductsSupportAnyDelivery,
} from "@molha/api-contract";
import { isProductBuyNFreeActive } from "@izibuy/shared-lib";
import { ChevronLeft } from "lucide-react";

import { buildCheckoutPickupLocations } from "../../../entities/cart/lib/buildCheckoutPickupLocations.js";
import { resolveCartAllowedPaymentMethods } from "../../../entities/cart/lib/resolveCartAllowedPaymentMethods.js";
import { resolveCartSellerDelivery } from "../../../entities/cart/lib/resolveCartSellerDelivery.js";
import { fetchSellerDeliveryQuote } from "../../../entities/cart/api/sellerDeliveryQuote.js";
import { getCartLineExclusionReason } from "../../../entities/cart/lib/getCartLineExclusionReason.js";
import {
  groupCartLinesBySeller,
  resolveCartFulfillmentBySeller,
} from "../../../entities/cart/lib/groupCartLinesBySeller.js";
import { scopeRecordBySellerId } from "../../../entities/cart/lib/scopeRecordBySellerId.js";
import { useCardPrepaidAvailable } from "../../../entities/payment/model/paymentQueries.js";
import { selectCartCheckoutSummary } from "../../../entities/cart/lib/selectCartCheckoutSummary.js";
import { selectCartLines } from "../../../entities/cart/lib/selectCartLines.js";
import { useCart } from "../../../entities/cart/model/useCart.js";
import { useCartSelection } from "../../../entities/cart/model/useCartSelection.js";
import { useCartFlashSalePriceTick } from "../../../entities/cart/model/useCartFlashSalePriceTick.js";
import { useCreateOrderMutation } from "../../../entities/order/model/useCreateOrderMutation.js";
import { useCartProductsQuery } from "../../../entities/product/model/useCartProductsQuery.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { fetchMyProductBuyNFreeProgress } from "../../../entities/product/api/fetchMyProductBuyNFreeProgress.js";
import { fetchMyAppliedProductPromos } from "../../../entities/product-promo-code/api/productPromoCodeApi.js";
import { productPromoCodeQueryKeys } from "../../../entities/product-promo-code/model/productPromoCodeQueryKeys.js";
import { invalidatePriceOfferQueries } from "../../../entities/product-price-offer/lib/priceOfferQueryCache.js";
import { useMyAcceptedBidsQuery } from "../../../entities/product-price-offer/model/useMyAcceptedBidsQuery.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { userSavedAddressesFromUser } from "../../../entities/address/lib/userSavedAddressesFromUser.js";
import { CheckoutForm } from "../../../shared/ui/CheckoutForm/CheckoutForm.jsx";
import { CheckoutSheetModal } from "../../../features/checkout/ui/CheckoutSheetModal.jsx";
import {
  CART_AUCTION_UI,
  CART_DELIVERY_FEE_UI,
  CART_PAGE_UI,
  CHECKOUT_FORM_UI,
} from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";

import { CartAuctionSection } from "./CartAuctionSection.jsx";
import { CartFulfillmentSection } from "./CartFulfillmentSection.jsx";
import { CartSellerList } from "./CartSellerList.jsx";
import { CartPageSkeleton } from "./CartPageSkeleton.jsx";

import "./CartPage.css";

const SELLER_CHECKOUT_FORM_ID = "cart-seller-checkout-form";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   currentUserId?: string | null;
 *   onRequestLogin: () => void;
 *   onGoToCatalog: () => void;
 *   onCheckoutSuccess: () => void;
 * }} props
 */
export function CartPage({
  isAuthorized,
  currentUserId = null,
  onRequestLogin,
  onGoToCatalog,
  onCheckoutSuccess,
}) {
  const { items, clearCart, removeItems, priceSnapshots } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createOrderMutation = useCreateOrderMutation();
  const cartProductIds = useMemo(() => Object.keys(items), [items]);
  const productsQuery = useCartProductsQuery({ productIds: cartProductIds });
  const cartPriceNowMs = useCartFlashSalePriceTick(items, productsQuery.data ?? []);
  const acceptedBidsQuery = useMyAcceptedBidsQuery({ enabled: isAuthorized });
  const appliedPromosQuery = useQuery({
    queryKey: productPromoCodeQueryKeys.appliedMine(),
    queryFn: fetchMyAppliedProductPromos,
    enabled: isAuthorized,
    staleTime: 60_000,
  });
  const { user } = useAuthSession();

  const auctionBids = acceptedBidsQuery.data ?? [];
  const phase =
    cartProductIds.length === 0
      ? "success"
      : productsQuery.isLoading
        ? "loading"
        : productsQuery.isError
          ? "error"
          : "success";
  const error =
    productsQuery.error instanceof Error
      ? productsQuery.error.message
      : CART_PAGE_UI.LOADING;

  const defaultAddress = useMemo(() => {
    if (!isAuthorized || !user) {
      return {};
    }
    return {
      userAddress: user.userAddress,
      userAddressFlat: user.userAddressFlat,
      userAddressFiasId: user.userAddressFiasId,
      userAddressGeo: user.userAddressGeo,
    };
  }, [isAuthorized, user]);

  const savedDeliveryAddresses = useMemo(() => {
    if (!isAuthorized || !user) {
      return [];
    }
    return userSavedAddressesFromUser(user);
  }, [isAuthorized, user]);

  /** Внутренняя корзина продавца; null — общий список продавцов. */
  const [activeSellerCartId, setActiveSellerCartId] = useState(
    /** @type {string | null} */ (null),
  );
  /** Сумма курьеру по продавцам; минимум задаёт контракт. */
  const [deliveryFeeBySeller, setDeliveryFeeBySeller] = useState(
    /** @type {Record<string, number>} */ ({}),
  );
  /** Выбор покупателя по продавцам; пустое значение = дефолт отправления. */
  const [chosenFulfillmentBySeller, setChosenFulfillmentBySeller] = useState(
    /** @type {Record<string, "pickup" | "delivery">} */ ({}),
  );
  const [auctionCheckoutBid, setAuctionCheckoutBid] = useState(
    /** @type {import('../../../entities/product-price-offer/model/types.js').PriceOfferBuyerBidRow | null} */ (
      null
    ),
  );
  const [submitState, setSubmitState] = useState({
    isSubmitting: false,
    error: "",
    success: "",
  });
  /** Хост для «Способа оплаты» вне карточки получения. */
  const [paymentMethodHostEl, setPaymentMethodHostEl] = useState(
    /** @type {HTMLDivElement | null} */ (null),
  );
  /** Хост для «Способа получения» вне карточки деталей. */
  const [fulfillmentMethodHostEl, setFulfillmentMethodHostEl] = useState(
    /** @type {HTMLDivElement | null} */ (null),
  );

  /** Оформление обычной корзины — на странице продавца; sheet только у аукциона. */
  const checkoutSellerId = auctionCheckoutBid ? null : activeSellerCartId;

  const handleProductClick = useCallback(
    (product) => {
      navigateToProductDetails(navigate, product);
    },
    [navigate],
  );

  const buyNFreeProductIds = useMemo(() => {
    const products = productsQuery.data ?? [];
    return products
      .filter(
        (product) => isProductBuyNFreeActive(product) && items[String(product._id)],
      )
      .map((product) => String(product._id));
  }, [items, productsQuery.data]);

  const buyNFreeProgressQueries = useQueries({
    queries: buyNFreeProductIds.map((productId) => ({
      queryKey: ["product-buy-n-free-progress", productId],
      queryFn: () => fetchMyProductBuyNFreeProgress(productId),
      enabled: isAuthorized && productId.length > 0,
      staleTime: 15_000,
    })),
  });

  const buyNFreeProgressByProductId = useMemo(() => {
    /** @type {Record<string, { completedPaidOrderCount?: number; freeClaimPending?: boolean }>} */
    const map = {};
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

  const { lines } = useMemo(
    () =>
      selectCartLines(
        items,
        productsQuery.data ?? [],
        appliedPromosQuery.data?.appliedPromos ?? [],
        priceSnapshots,
        cartPriceNowMs,
        buyNFreeProgressByProductId,
      ),
    [
      items,
      productsQuery.data,
      appliedPromosQuery.data,
      priceSnapshots,
      cartPriceNowMs,
      buyNFreeProgressByProductId,
    ],
  );

  const visibleLines = useMemo(
    () =>
      lines.filter((line) => getCartLineExclusionReason(line, currentUserId) == null),
    [lines, currentUserId],
  );

  // Корзина делится на отправления — по одному на продавца. Способ получения
  // выбирает покупатель у каждого; раньше его выбирала сама корзина, и товар
  // с обоими способами всегда уезжал в самовывоз.
  const sellerGroups = useMemo(
    () => groupCartLinesBySeller(visibleLines),
    [visibleLines],
  );

  // Предоплата картой — только товары площадки; в sheet смотрим активного продавца.
  const prepaidSellerIds = useMemo(() => {
    if (checkoutSellerId) {
      return [String(checkoutSellerId)];
    }
    return sellerGroups.map((group) => String(group.sellerId));
  }, [checkoutSellerId, sellerGroups]);
  const cardPrepaidAvailable = useCardPrepaidAvailable({
    sellerIds: prepaidSellerIds,
  });

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

  const cartSummary = useMemo(
    () => selectCartCheckoutSummary(visibleLines, currentUserId, deselectedIds),
    [visibleLines, currentUserId, deselectedIds],
  );

  /** Свод на каждое отправление — чтобы у продавца были свои итоги и чекбоксы. */
  const groupSummaries = useMemo(
    () =>
      sellerGroups.map((group) => ({
        group,
        summary: selectCartCheckoutSummary(group.lines, currentUserId, deselectedIds),
        productIds: group.lines.map((line) => line.productId),
      })),
    [sellerGroups, currentUserId, deselectedIds],
  );

  /**
   * Итоговый выбор способов, который уедет на сервер. Считается от групп, а не
   * от состояния: сохранившийся выбор мог стать недоступным, если покупатель
   * убрал из корзины товар, который его разрешал.
   */
  const fulfillmentBySellerId = useMemo(
    () => resolveCartFulfillmentBySeller(sellerGroups, chosenFulfillmentBySeller),
    [sellerGroups, chosenFulfillmentBySeller],
  );

  useEffect(() => {
    if (!activeSellerCartId) {
      return;
    }
    const stillThere = sellerGroups.some(
      (group) => String(group.sellerId) === String(activeSellerCartId),
    );
    if (!stillThere) {
      setActiveSellerCartId(null);
    }
  }, [activeSellerCartId, sellerGroups]);

  const activeSellerEntry = useMemo(() => {
    if (!activeSellerCartId) {
      return null;
    }
    return (
      groupSummaries.find(
        (entry) => String(entry.group.sellerId) === String(activeSellerCartId),
      ) ?? null
    );
  }, [activeSellerCartId, groupSummaries]);

  const activeSummary = useMemo(() => {
    if (checkoutSellerId) {
      const found = groupSummaries.find(
        (entry) => String(entry.group.sellerId) === String(checkoutSellerId),
      );
      return (
        found?.summary ?? selectCartCheckoutSummary([], currentUserId, deselectedIds)
      );
    }
    if (activeSellerEntry) {
      return activeSellerEntry.summary;
    }
    return cartSummary;
  }, [
    checkoutSellerId,
    groupSummaries,
    activeSellerEntry,
    cartSummary,
    currentUserId,
    deselectedIds,
  ]);

  const isCartEmpty = lines.length === 0 && auctionBids.length === 0;
  const isAuctionCheckoutOpen = auctionCheckoutBid != null;

  const scopedFulfillmentBySellerId = useMemo(
    () => scopeRecordBySellerId(fulfillmentBySellerId, checkoutSellerId),
    [checkoutSellerId, fulfillmentBySellerId],
  );

  const scopedDeliveryFeeBySellerId = useMemo(
    () => scopeRecordBySellerId(deliveryFeeBySeller, checkoutSellerId),
    [checkoutSellerId, deliveryFeeBySeller],
  );

  const checkoutSellerGroups = useMemo(() => {
    if (!checkoutSellerId) {
      return sellerGroups;
    }
    return sellerGroups.filter(
      (group) => String(group.sellerId) === String(checkoutSellerId),
    );
  }, [checkoutSellerId, sellerGroups]);

  // Покупатель видит только те оплаты, что принимает продавец этого
  // отправления. На аукционном чекауте групп нет — там остаются все.
  const allowedPaymentMethods = useMemo(
    () => resolveCartAllowedPaymentMethods(checkoutSellerGroups),
    [checkoutSellerGroups],
  );

  // Тариф собственной доставки продавца. Сумму собирает функция контракта,
  // расстояние по дорогам приходит котировкой с сервера — ниже.
  const sellerDelivery = useMemo(
    () =>
      resolveCartSellerDelivery({
        sellerGroups: checkoutSellerGroups,
        fulfillmentBySellerId,
        goodsTotalRub: activeSummary.selectedTotal,
      }),
    [checkoutSellerGroups, fulfillmentBySellerId, activeSummary.selectedTotal],
  );

  const [checkoutDeliveryAddress, setCheckoutDeliveryAddress] = useState(
    /** @type {{ line: string; flat: string; geo: { lat: number; lon: number } | null; isValid: boolean } | null} */ (
      null
    ),
  );

  const handleDeliveryAddressChange = useCallback((address) => {
    setCheckoutDeliveryAddress(address);
  }, []);

  const pickupLocations = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.data ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return buildCheckoutPickupLocations([{ product }]);
    }
    // Точки самовывоза / отправления всегда с выбранных строк. Раньше при
    // «доставке продавцом» их выкидывали — и при самовывозе чекаут мог
    // остаться с пустым списком («адреса нет»), хотя на товаре он есть.
    return buildCheckoutPickupLocations(activeSummary.selectedLines);
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.data]);

  const deliveryAvailable = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.data ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return doProductsSupportAnyDelivery([product]);
    }
    return doProductsSupportAnyDelivery(
      activeSummary.selectedLines.map((line) => line.product),
    );
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.data]);

  const pickupAvailable = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.data ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return doProductsSupportPickup([product]);
    }
    return doProductsSupportPickup(
      activeSummary.selectedLines.map((line) => line.product),
    );
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.data]);

  /**
   * Кто везёт выбранное: курьеры Gitorg или сам продавец.
   *
   * Решает продавец на товаре, покупатель это только видит.
   */
  const checkoutCourierDelivery = useMemo(() => {
    const deliveryGroups = checkoutSellerGroups.filter(
      (group) => fulfillmentBySellerId[String(group.sellerId)] === "delivery",
    );
    if (deliveryGroups.length === 0) return null;
    const withCourier = deliveryGroups.filter((group) => group.courierDelivery);
    if (withCourier.length === deliveryGroups.length) return "courier";
    if (withCourier.length === 0) return "seller";
    return "mixed";
  }, [checkoutSellerGroups, fulfillmentBySellerId]);

  /** Товары, которые везут: по ним считается стоимость доставки. */
  const deliveryProductIds = useMemo(() => {
    if (auctionCheckoutBid) return [];
    return activeSummary.selectedLines
      .filter((line) => {
        const sellerId = String(
          line?.product?.productSeller?._id ?? line?.product?.productSeller ?? "",
        );
        return fulfillmentBySellerId[sellerId] === "delivery";
      })
      .map((line) => String(line.productId))
      .filter(Boolean);
  }, [auctionCheckoutBid, activeSummary.selectedLines, fulfillmentBySellerId]);

  // Расстояние по дорогам для тарифа продавца считает сервер — тем же путём,
  // что и заказ. Раньше корзина мерила его сама по своей точке, заказ — по
  // точке DaData, и покупатель видел 180 ₽, а платил 210 ₽.
  const debouncedDeliveryAddress = useDebouncedValue(checkoutDeliveryAddress, 500);
  const sellerDeliveryNeedsDistance = Boolean(
    sellerDelivery && sellerDelivery.tariff.perKmRub > 0,
  );
  const quoteProductIdsKey = useMemo(
    () => [...deliveryProductIds].sort().join(","),
    [deliveryProductIds],
  );
  const quoteGeoLat = debouncedDeliveryAddress?.geo?.lat ?? null;
  const quoteGeoLon = debouncedDeliveryAddress?.geo?.lon ?? null;
  const sellerDeliveryQuoteQuery = useQuery({
    queryKey: [
      "seller-delivery-quote",
      quoteProductIdsKey,
      debouncedDeliveryAddress?.line ?? "",
      debouncedDeliveryAddress?.flat ?? "",
      quoteGeoLat,
      quoteGeoLon,
    ],
    queryFn: () =>
      fetchSellerDeliveryQuote({
        productIds: quoteProductIdsKey.split(","),
        deliveryAddress: debouncedDeliveryAddress?.line ?? "",
        deliveryAddressFlat: debouncedDeliveryAddress?.flat ?? "",
        deliveryAddressGeo:
          quoteGeoLat != null && quoteGeoLon != null
            ? { lat: quoteGeoLat, lon: quoteGeoLon }
            : null,
      }),
    enabled:
      sellerDeliveryNeedsDistance &&
      quoteProductIdsKey.length > 0 &&
      debouncedDeliveryAddress?.isValid === true,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const sellerDeliveryDistance = useMemo(() => {
    if (!sellerDeliveryNeedsDistance) {
      return null;
    }
    const addressReady = checkoutDeliveryAddress?.isValid === true;
    const entry = (sellerDeliveryQuoteQuery.data?.sellers ?? []).find(
      (row) => String(row.sellerId) === String(sellerDelivery?.sellerId),
    );
    const km = Number(entry?.distanceKm);
    return {
      distanceKm: addressReady && entry && Number.isFinite(km) ? km : null,
      distanceSource: entry?.distanceSource ?? null,
      isLoading:
        addressReady &&
        (sellerDeliveryQuoteQuery.isFetching ||
          checkoutDeliveryAddress !== debouncedDeliveryAddress),
      errorMessage:
        addressReady && sellerDeliveryQuoteQuery.error instanceof Error
          ? sellerDeliveryQuoteQuery.error.message
          : "",
    };
  }, [
    sellerDeliveryNeedsDistance,
    checkoutDeliveryAddress,
    debouncedDeliveryAddress,
    sellerDelivery,
    sellerDeliveryQuoteQuery.data,
    sellerDeliveryQuoteQuery.isFetching,
    sellerDeliveryQuoteQuery.error,
  ]);

  const closeAuctionCheckout = () => {
    setAuctionCheckoutBid(null);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
  };

  /** @param {string} sellerId */
  const openSellerCart = (sellerId) => {
    setAuctionCheckoutBid(null);
    setActiveSellerCartId(sellerId);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
  };

  const closeSellerCart = () => {
    setActiveSellerCartId(null);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
  };

  /** @param {string} sellerId @param {number} feeRub */
  const chooseDeliveryFee = (sellerId, feeRub) => {
    const clamped = Math.max(CART_DELIVERY_FEE_UI.MIN_RUB, feeRub);
    setDeliveryFeeBySeller((prev) => ({ ...prev, [sellerId]: clamped }));
  };

  /** @param {string} sellerId @param {"pickup" | "delivery"} method */
  const chooseSellerFulfillment = (sellerId, method) => {
    setChosenFulfillmentBySeller((prev) => ({ ...prev, [sellerId]: method }));
  };

  const handleOpenAuctionCheckout = (bid) => {
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setActiveSellerCartId(null);
    setAuctionCheckoutBid(bid);
  };

  const handleCheckoutSubmit = async ({
    fulfillmentMethod,
    deliveryAddress,
    deliveryAddressFlat,
    paymentMethod,
    pickupSelections,
  }) => {
    setSubmitState({ isSubmitting: true, error: "", success: "" });

    if (auctionCheckoutBid) {
      try {
        await createOrderMutation.mutateAsync({
          items: [{ productId: auctionCheckoutBid.productId, quantity: 1 }],
          priceOfferId: auctionCheckoutBid._id,
          fulfillmentMethod,
          deliveryAddress,
          deliveryAddressFlat,
          paymentMethod,
          pickupSelections,
        });
        setAuctionCheckoutBid(null);
        setSubmitState({
          isSubmitting: false,
          error: "",
          success: CART_AUCTION_UI.ORDER_PLACED,
        });
        void invalidatePriceOfferQueries(queryClient);
        onCheckoutSuccess();
      } catch (e) {
        setSubmitState({
          isSubmitting: false,
          error: e instanceof Error ? e.message : CHECKOUT_FORM_UI.ERROR_GENERIC,
          success: "",
        });
      }
      return;
    }

    const orderedProductIds = activeSummary.selectedLines.map((line) => line.productId);
    try {
      await createOrderMutation.mutateAsync({
        items: activeSummary.selectedLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        fulfillmentMethod,
        fulfillmentBySellerId: scopedFulfillmentBySellerId,
        deliveryFeeBySellerId: scopedDeliveryFeeBySellerId,
        deliveryAddress,
        deliveryAddressFlat,
        paymentMethod,
        pickupSelections,
      });
      removeItems(orderedProductIds);
      setActiveSellerCartId(null);

      // Предоплату здесь не начинаем: сначала продавец подтверждает, что товар
      // есть, и только потом покупатель платит. Иначе на каждый «нет в
      // наличии» приходился бы возврат денег руками через кабинет банка.
      // Кнопка оплаты ждёт покупателя в «Моих покупках».
      setSubmitState({
        isSubmitting: false,
        error: "",
        success: CHECKOUT_FORM_UI.SUCCESS,
      });
      onCheckoutSuccess();
    } catch (e) {
      setSubmitState({
        isSubmitting: false,
        error: e instanceof Error ? e.message : CHECKOUT_FORM_UI.ERROR_GENERIC,
        success: "",
      });
    }
  };

  const activeSellerCart = activeSellerEntry
    ? {
        group: activeSellerEntry.group,
        summary: activeSellerEntry.summary,
        productIds: activeSellerEntry.productIds,
        canCheckout:
          activeSellerEntry.summary.selectedLines.length > 0 &&
          !activeSellerEntry.summary.checkoutBlockReason,
      }
    : null;

  if (!isAuthorized) {
    return (
      <div className="cart-page cart-page--centered">
        <p className="cart-page__message">{CART_PAGE_UI.AUTH_REQUIRED}</p>
        <button
          type="button"
          className="cart-page__primary-action"
          onClick={onRequestLogin}
        >
          {CART_PAGE_UI.AUTH_LOGIN}
        </button>
      </div>
    );
  }

  if (phase === "loading") {
    return <CartPageSkeleton />;
  }
  if (phase === "error") {
    return (
      <p className="cart-page__state cart-page__state_error" role="alert">
        {error}
      </p>
    );
  }

  if (isCartEmpty) {
    return (
      <div className="cart-page cart-page--centered">
        <p className="cart-page__message">{CART_PAGE_UI.EMPTY}</p>
        <button
          type="button"
          className="cart-page__primary-action"
          onClick={onGoToCatalog}
        >
          {CART_PAGE_UI.GO_TO_CATALOG}
        </button>
      </div>
    );
  }

  if (visibleLines.length === 0 && auctionBids.length === 0) {
    return (
      <div className="cart-page cart-page--centered">
        <p className="cart-page__message">
          {CART_PAGE_UI.CHECKOUT_BLOCKED_ALL_UNAVAILABLE}
        </p>
        <button type="button" className="cart-page__clear-button" onClick={clearCart}>
          {CART_PAGE_UI.CLEAR_ALL}
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page cart-page--sections">
      <div className="cart-page__content">
        {activeSellerCart ? (
          <>
            <div className="cart-page__seller-cart-nav">
              <button
                type="button"
                className="cart-page__back-to-sellers"
                onClick={closeSellerCart}
              >
                <AppIcon icon={ChevronLeft} size={18} aria-hidden />
                {CART_PAGE_UI.BACK_TO_SELLERS}
              </button>
            </div>

            <CartFulfillmentSection
              key={activeSellerCart.group.sellerId || "unknown-seller"}
              title={
                activeSellerCart.group.sellerName ||
                CART_PAGE_UI.SECTION_SELLER_FALLBACK
              }
              lines={activeSellerCart.group.lines}
              selectedCount={selectedCountIn(activeSellerCart.productIds)}
              areAllSelected={areAllSelectedIn(activeSellerCart.productIds)}
              onToggleAll={() => toggleAllIn(activeSellerCart.productIds)}
              isLineSelected={isLineSelected}
              onToggleSelected={toggleLine}
              onProductClick={handleProductClick}
              summary={activeSellerCart.summary}
              canCheckout={activeSellerCart.canCheckout}
              checkoutFormId={SELLER_CHECKOUT_FORM_ID}
              isCheckoutSubmitting={submitState.isSubmitting}
              sellerDelivery={sellerDelivery}
              sellerDeliveryDistance={sellerDeliveryDistance}
              checkoutBeforeDock={
                <>
                  <div
                    ref={setFulfillmentMethodHostEl}
                    className="cart-fulfillment__method-card"
                  />
                  <div className="cart-fulfillment__details">
                    <CheckoutForm
                      id={SELLER_CHECKOUT_FORM_ID}
                      defaultDeliveryAddress={defaultAddress}
                      savedDeliveryAddresses={savedDeliveryAddresses}
                      pickupLocations={pickupLocations}
                      deliveryAvailable={deliveryAvailable}
                      pickupAvailable={pickupAvailable}
                      fulfillmentMode={null}
                      courierDelivery={checkoutCourierDelivery}
                      deliveryProductIds={deliveryProductIds}
                      initialFulfillmentMethod={
                        fulfillmentBySellerId[activeSellerCart.group.sellerId] ??
                        "pickup"
                      }
                      onFulfillmentMethodChange={(method) =>
                        chooseSellerFulfillment(
                          activeSellerCart.group.sellerId,
                          method,
                        )
                      }
                      cardPrepaidAvailable={cardPrepaidAvailable}
                      allowedPaymentMethods={allowedPaymentMethods}
                      onDeliveryAddressChange={handleDeliveryAddressChange}
                      isSubmitting={submitState.isSubmitting}
                      submitError={submitState.error}
                      submitSuccess={submitState.success}
                      isDisabled={!activeSellerCart.canCheckout}
                      showHeading={false}
                      showSubmitButton={false}
                      fulfillmentMethodPortalTarget={fulfillmentMethodHostEl}
                      paymentMethodPortalTarget={paymentMethodHostEl}
                      onSubmit={handleCheckoutSubmit}
                    />
                  </div>
                  <div
                    ref={setPaymentMethodHostEl}
                    className="cart-fulfillment__payment"
                  />
                </>
              }
              deliveryFee={
                activeSellerCart.group.courierDelivery &&
                fulfillmentBySellerId[activeSellerCart.group.sellerId] === "delivery"
                  ? {
                      value:
                        deliveryFeeBySeller[activeSellerCart.group.sellerId] ??
                        CART_DELIVERY_FEE_UI.MIN_RUB,
                      onChange: (next) =>
                        chooseDeliveryFee(activeSellerCart.group.sellerId, next),
                    }
                  : null
              }
              showDeliveryFeeNote={false}
            />
          </>
        ) : (
          <>
            <CartAuctionSection
              bids={auctionBids}
              onCheckout={handleOpenAuctionCheckout}
            />

            <CartSellerList entries={groupSummaries} onOpenSeller={openSellerCart} />
          </>
        )}
      </div>

      <CheckoutSheetModal
        isOpen={isAuctionCheckoutOpen}
        onClose={closeAuctionCheckout}
        defaultDeliveryAddress={defaultAddress}
        savedDeliveryAddresses={savedDeliveryAddresses}
        pickupLocations={pickupLocations}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
        fulfillmentMode={null}
        courierDelivery={checkoutCourierDelivery}
        deliveryProductIds={deliveryProductIds}
        initialFulfillmentMethod={null}
        onFulfillmentMethodChange={null}
        cardPrepaidAvailable={cardPrepaidAvailable}
        allowedPaymentMethods={allowedPaymentMethods}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        isDisabled={false}
        onSubmit={handleCheckoutSubmit}
      />
    </div>
  );
}
