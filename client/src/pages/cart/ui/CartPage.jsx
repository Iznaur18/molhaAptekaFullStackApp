import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { getCartLineExclusionReason } from "../../../entities/cart/lib/getCartLineExclusionReason.js";
import { selectCartCheckoutSummary } from "../../../entities/cart/lib/selectCartCheckoutSummary.js";
import { selectCartLines } from "../../../entities/cart/lib/selectCartLines.js";
import { useCart } from "../../../entities/cart/model/useCart.js";
import { useCartSelection } from "../../../entities/cart/model/useCartSelection.js";
import { useCreateOrderMutation } from "../../../entities/order/model/useCreateOrderMutation.js";
import { useAllProductsQuery } from "../../../entities/product/model/useAllProductsQuery.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { invalidatePriceOfferQueries } from "../../../entities/product-price-offer/lib/priceOfferQueryCache.js";
import { useMyAcceptedBidsQuery } from "../../../entities/product-price-offer/model/useMyAcceptedBidsQuery.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { CheckoutSheetModal } from "../../../features/checkout/ui/CheckoutSheetModal.jsx";
import {
  CART_AUCTION_UI,
  CART_PAGE_UI,
  CHECKOUT_FORM_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import { CartAuctionSection } from "./CartAuctionSection.jsx";
import { CartLineItem } from "./CartLineItem.jsx";
import { CartSelectAllRow } from "./CartSelectAllRow.jsx";

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
  const { items, clearCart, removeItems } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createOrderMutation = useCreateOrderMutation();
  const productsQuery = useAllProductsQuery();
  const acceptedBidsQuery = useMyAcceptedBidsQuery({ enabled: isAuthorized });
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

  const [checkoutSheetOpen, setCheckoutSheetOpen] = useState(false);
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

  const { lines } = useMemo(
    () => selectCartLines(items, productsQuery.data ?? []),
    [items, productsQuery.data],
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

  const {
    deselectedIds,
    isLineSelected,
    toggleLine,
    toggleAll,
    areAllSelected,
    selectedCount,
  } = useCartSelection(purchasableIds);

  const checkoutSummary = useMemo(
    () => selectCartCheckoutSummary(lines, currentUserId, deselectedIds),
    [lines, currentUserId, deselectedIds],
  );

  const canCheckout = checkoutSummary.selectedLines.length > 0;
  const isCartEmpty = lines.length === 0 && auctionBids.length === 0;
  const isCheckoutSheetOpen = checkoutSheetOpen || auctionCheckoutBid != null;
  const pickupAddressSummary = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.data ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return String(product?.productPickupAddress ?? "").trim();
    }
    const addresses = [];
    for (const line of checkoutSummary.selectedLines) {
      const address = String(line.product?.productPickupAddress ?? "").trim();
      if (address && !addresses.includes(address)) {
        addresses.push(address);
      }
    }
    return addresses.join("; ");
  }, [auctionCheckoutBid, checkoutSummary.selectedLines, productsQuery.data]);
  const totalLabel = checkoutSummary.hasPartialSelection
    ? CART_PAGE_UI.PURCHASABLE_TOTAL_LABEL
    : CART_PAGE_UI.TOTAL_LABEL;

  const closeCheckoutSheet = () => {
    setCheckoutSheetOpen(false);
    setAuctionCheckoutBid(null);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
  };

  const handleOpenAuctionCheckout = (bid) => {
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setCheckoutSheetOpen(false);
    setAuctionCheckoutBid(bid);
  };

  const handleCheckoutSubmit = async ({
    fulfillmentMethod,
    deliveryAddress,
    deliveryAddressFlat,
    paymentMethod,
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

    const orderedProductIds = checkoutSummary.selectedLines.map(
      (line) => line.productId,
    );
    try {
      await createOrderMutation.mutateAsync({
        items: checkoutSummary.selectedLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        fulfillmentMethod,
        deliveryAddress,
        deliveryAddressFlat,
        paymentMethod,
      });
      removeItems(orderedProductIds);
      setCheckoutSheetOpen(false);
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
    <div className="cart-page">
      <div className="cart-page__content">
        <CartAuctionSection
          bids={auctionBids}
          onCheckout={handleOpenAuctionCheckout}
        />

        {visibleLines.length > 0 ? (
          <>
            <CartSelectAllRow
              selectedCount={selectedCount}
              totalCount={purchasableIds.length}
              areAllSelected={areAllSelected}
              onToggleAll={toggleAll}
            />
            <ul className="cart-page__list" role="list">
              {visibleLines.map((line) => (
                <li
                  key={line.productId}
                  className="cart-page__item"
                  role="listitem"
                >
                  <CartLineItem
                    line={line}
                    selected={isLineSelected(line.productId)}
                    onToggleSelected={toggleLine}
                    onProductClick={handleProductClick}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {visibleLines.length > 0 ? (
        <div className="cart-page__dock">
          <div className="cart-page__dock-top">
            <div className="cart-page__dock-total">
              <span className="cart-page__total-label">{totalLabel}</span>
              <span className="cart-page__total-value">
                {formatPriceRub(checkoutSummary.selectedTotal)}
              </span>
              {checkoutSummary.hasPartialSelection ? (
                <span className="cart-page__full-total-hint">
                  {formatPriceRub(checkoutSummary.fullTotal)}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className="cart-page__clear-button"
              onClick={clearCart}
            >
              {CART_PAGE_UI.CLEAR_ALL}
            </button>
          </div>

          {!canCheckout && checkoutSummary.checkoutBlockReason ? (
            <p className="cart-page__checkout-hint">
              {checkoutSummary.checkoutBlockReason}
            </p>
          ) : null}

          <button
            type="button"
            className="cart-page__checkout-cta"
            disabled={!canCheckout}
            onClick={() => {
              setAuctionCheckoutBid(null);
              setSubmitState({
                isSubmitting: false,
                error: "",
                success: "",
              });
              setCheckoutSheetOpen(true);
            }}
          >
            {CART_PAGE_UI.CHECKOUT_OPEN}
          </button>
        </div>
      ) : null}

      <CheckoutSheetModal
        isOpen={isCheckoutSheetOpen}
        onClose={closeCheckoutSheet}
        defaultDeliveryAddress={defaultAddress}
        pickupAddressSummary={pickupAddressSummary}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        isDisabled={auctionCheckoutBid == null && !canCheckout}
        onSubmit={handleCheckoutSubmit}
      />
    </div>
  );
}
