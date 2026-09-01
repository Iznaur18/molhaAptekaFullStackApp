import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  doProductsSupportPickup,
  doProductsSupportAnyDelivery,
} from "@molha/api-contract";
import { isProductBuyNFreeActive } from "@izibuy/shared-lib";

import { buildCheckoutPickupLocations } from "../../../entities/cart/lib/buildCheckoutPickupLocations.js";
import { getCartLineExclusionReason } from "../../../entities/cart/lib/getCartLineExclusionReason.js";
import {
  groupCartLinesBySeller,
  resolveCartFulfillmentBySeller,
} from "../../../entities/cart/lib/groupCartLinesBySeller.js";
import { selectCartCheckoutSummary } from "../../../entities/cart/lib/selectCartCheckoutSummary.js";
import { selectCartLines } from "../../../entities/cart/lib/selectCartLines.js";
import { useCart } from "../../../entities/cart/model/useCart.js";
import { useCartSelection } from "../../../entities/cart/model/useCartSelection.js";
import { useCartFlashSalePriceTick } from "../../../entities/cart/model/useCartFlashSalePriceTick.js";
import { useCreateOrderMutation } from "../../../entities/order/model/useCreateOrderMutation.js";
import { useAllProductsQuery } from "../../../entities/product/model/useAllProductsQuery.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { fetchMyProductBuyNFreeProgress } from "../../../entities/product/api/fetchMyProductBuyNFreeProgress.js";
import { fetchMyAppliedProductPromos } from "../../../entities/product-promo-code/api/productPromoCodeApi.js";
import { productPromoCodeQueryKeys } from "../../../entities/product-promo-code/model/productPromoCodeQueryKeys.js";
import { invalidatePriceOfferQueries } from "../../../entities/product-price-offer/lib/priceOfferQueryCache.js";
import { useMyAcceptedBidsQuery } from "../../../entities/product-price-offer/model/useMyAcceptedBidsQuery.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { userSavedAddressesFromUser } from "../../../entities/address/lib/userSavedAddressesFromUser.js";
import { CheckoutSheetModal } from "../../../features/checkout/ui/CheckoutSheetModal.jsx";
import {
  CART_AUCTION_UI,
  CART_DELIVERY_FEE_UI,
  CART_PAGE_UI,
  CHECKOUT_FORM_UI,
} from "../../../shared/config/appUiCopy.js";

import { CartAuctionSection } from "./CartAuctionSection.jsx";
import { CartCheckoutBar } from "./CartCheckoutBar.jsx";
import { CartFulfillmentSection } from "./CartFulfillmentSection.jsx";

import "./CartPage.css";

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
  const productsQuery = useAllProductsQuery();
  const cartPriceNowMs = useCartFlashSalePriceTick(items, productsQuery.data ?? []);
  const acceptedBidsQuery = useMyAcceptedBidsQuery({ enabled: isAuthorized });
  const appliedPromosQuery = useQuery({
    queryKey: productPromoCodeQueryKeys.appliedMine(),
    queryFn: fetchMyAppliedProductPromos,
    enabled: isAuthorized,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const { user } = useAuthSession();

  const auctionBids = acceptedBidsQuery.data ?? [];
  const phase = productsQuery.isPending
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

  /** Заказ теперь один на всю корзину; секций по способу больше нет. */
  const [isCartCheckoutOpen, setIsCartCheckoutOpen] = useState(false);
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

  const handleProductClick = useCallback(
    (product) => {
      navigateToProductDetails(navigate, product);
    },
    [navigate],
  );

  const buyNFreeProductIds = useMemo(() => {
    const products = productsQuery.data ?? [];
    return products
      .filter((product) => isProductBuyNFreeActive(product) && items[String(product._id)])
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
      lines.filter(
        (line) => getCartLineExclusionReason(line, currentUserId) == null,
      ),
    [lines, currentUserId],
  );

  // Корзина делится на отправления — по одному на продавца. Способ получения
  // выбирает покупатель у каждого; раньше его выбирала сама корзина, и товар
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

  const cartSummary = useMemo(
    () => selectCartCheckoutSummary(visibleLines, currentUserId, deselectedIds),
    [visibleLines, currentUserId, deselectedIds],
  );

  /** Свод на каждое отправление — чтобы у продавца были свои итоги и чекбоксы. */
  const groupSummaries = useMemo(
    () =>
      sellerGroups.map((group) => ({
        group,
        summary: selectCartCheckoutSummary(
          group.lines,
          currentUserId,
          deselectedIds,
        ),
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

  const activeSummary = cartSummary;
  const canCheckoutActive = activeSummary.selectedLines.length > 0;
  const isCartEmpty = lines.length === 0 && auctionBids.length === 0;
  const isCheckoutSheetOpen = isCartCheckoutOpen || auctionCheckoutBid != null;

  const pickupLocations = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.data ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return buildCheckoutPickupLocations([{ product }]);
    }
    // Точка нужна и покупателю, который забирает сам, и курьеру — ему это
    // адрес, откуда везти. Не нужна она только там, где везёт сам продавец:
    // он отправляет откуда захочет.
    const courierSellerIds = new Set(
      sellerGroups
        .filter((group) => group.courierDelivery)
        .map((group) => String(group.sellerId)),
    );
    const pickupLines = activeSummary.selectedLines.filter((line) => {
      const sellerId = String(
        line?.product?.productSeller?._id ?? line?.product?.productSeller ?? "",
      );
      return (
        fulfillmentBySellerId[sellerId] !== "delivery" ||
        courierSellerIds.has(sellerId)
      );
    });
    return buildCheckoutPickupLocations(pickupLines);
  }, [
    auctionCheckoutBid,
    activeSummary.selectedLines,
    fulfillmentBySellerId,
    sellerGroups,
    productsQuery.data,
  ]);

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
   * Что форме чекаута собирать: адрес, точки самовывоза или и то и другое.
   *
   * Считаем по выбранным позициям, а не по всей корзине: невыбранное в заказ
   * не поедет и требовать под него адрес незачем.
   */
  const cartFulfillmentMode = useMemo(() => {
    if (auctionCheckoutBid) return null;

    const selectedIds = new Set(
      activeSummary.selectedLines.map((line) => line.productId),
    );
    let hasPickup = false;
    let hasDelivery = false;

    for (const { group, productIds } of groupSummaries) {
      if (!productIds.some((id) => selectedIds.has(id))) continue;
      if (fulfillmentBySellerId[group.sellerId] === "delivery") {
        hasDelivery = true;
      } else {
        hasPickup = true;
      }
    }

    if (hasPickup && hasDelivery) return "mixed";
    if (hasDelivery) return "delivery";
    return "pickup";
  }, [auctionCheckoutBid, activeSummary.selectedLines, groupSummaries, fulfillmentBySellerId]);

  const closeCheckoutSheet = () => {
    setIsCartCheckoutOpen(false);
    setAuctionCheckoutBid(null);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
  };

  const openCartCheckout = () => {
    setAuctionCheckoutBid(null);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setIsCartCheckoutOpen(true);
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
    setIsCartCheckoutOpen(false);
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
          error:
            e instanceof Error ? e.message : CHECKOUT_FORM_UI.ERROR_GENERIC,
          success: "",
        });
      }
      return;
    }

    const orderedProductIds = activeSummary.selectedLines.map(
      (line) => line.productId,
    );
    try {
      await createOrderMutation.mutateAsync({
        items: activeSummary.selectedLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        fulfillmentMethod,
        fulfillmentBySellerId,
        deliveryFeeBySellerId: deliveryFeeBySeller,
        deliveryAddress,
        deliveryAddressFlat,
        paymentMethod,
        pickupSelections,
      });
      removeItems(orderedProductIds);
      setIsCartCheckoutOpen(false);
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
    return <p className="cart-page__state">{CART_PAGE_UI.LOADING}</p>;
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
        <button
          type="button"
          className="cart-page__clear-button"
          onClick={clearCart}
        >
          {CART_PAGE_UI.CLEAR_ALL}
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page cart-page--sections">
      <div className="cart-page__content">
        <CartAuctionSection
          bids={auctionBids}
          onCheckout={handleOpenAuctionCheckout}
        />

        {groupSummaries.map(({ group, summary, productIds }) => (
          <CartFulfillmentSection
            key={group.sellerId || "unknown-seller"}
            title={group.sellerName || CART_PAGE_UI.SECTION_SELLER_FALLBACK}
            lines={group.lines}
            selectedCount={selectedCountIn(productIds)}
            areAllSelected={areAllSelectedIn(productIds)}
            onToggleAll={() => toggleAllIn(productIds)}
            isLineSelected={isLineSelected}
            onToggleSelected={toggleLine}
            onProductClick={handleProductClick}
            summary={summary}
            fulfillmentPicker={{
              value: fulfillmentBySellerId[group.sellerId] ?? group.defaultMethod,
              pickupAvailable: group.pickupAvailable,
              deliveryAvailable: group.deliveryAvailable,
              courierDelivery: group.courierDelivery,
              onChange: (method) =>
                chooseSellerFulfillment(group.sellerId, method),
            }}
            deliveryFee={group.courierDelivery ? {
              value:
                deliveryFeeBySeller[group.sellerId] ?? CART_DELIVERY_FEE_UI.MIN_RUB,
              onChange: (next) => chooseDeliveryFee(group.sellerId, next),
            } : null}
            showDeliveryFeeNote={false}
          />
        ))}

        <CartCheckoutBar
          summary={cartSummary}
          canCheckout={canCheckoutActive}
          onCheckout={openCartCheckout}
        />
      </div>

      <CheckoutSheetModal
        isOpen={isCheckoutSheetOpen}
        onClose={closeCheckoutSheet}
        defaultDeliveryAddress={defaultAddress}
        savedDeliveryAddresses={savedDeliveryAddresses}
        pickupLocations={pickupLocations}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
        fulfillmentMode={cartFulfillmentMode}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        isDisabled={auctionCheckoutBid == null && !canCheckoutActive}
        onSubmit={handleCheckoutSubmit}
      />
    </div>
  );
}
