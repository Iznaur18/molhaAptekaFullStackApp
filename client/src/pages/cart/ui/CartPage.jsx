import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { selectCartLines } from "../../../entities/cart/lib/selectCartLines.js";
import { useCart } from "../../../entities/cart/model/useCart.js";
import { useCreateOrderMutation } from "../../../entities/order/model/useCreateOrderMutation.js";
import { useAllProductsQuery } from "../../../entities/product/model/useAllProductsQuery.js";
import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { useMyAcceptedBidsQuery } from "../../../entities/product-price-offer/model/useMyAcceptedBidsQuery.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { CART_PAGE_UI, CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { CheckoutForm } from "../../../shared/ui/CheckoutForm/CheckoutForm.jsx";

import { CartAuctionSection } from "./CartAuctionSection.jsx";
import { CartLineItem } from "./CartLineItem.jsx";

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
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrderMutation = useCreateOrderMutation();
  const productsQuery = useAllProductsQuery();
  const acceptedBidsQuery = useMyAcceptedBidsQuery({ enabled: isAuthorized });
  const { user } = useAuthSession();

  const auctionBids = acceptedBidsQuery.data ?? [];

  const products = productsQuery.data ?? [];
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

  const { lines, total } = useMemo(
    () => selectCartLines(items, products),
    [items, products],
  );

  const purchasableLines = useMemo(
    () =>
      lines.filter(
        (line) =>
          !line.isMissing &&
          line.product?.productIsAvailable !== false &&
          !isCurrentUserProductSeller(line.product, currentUserId),
      ),
    [lines, currentUserId],
  );

  const isCartEmpty = lines.length === 0 && auctionBids.length === 0;
  const canCheckout = isAuthorized && purchasableLines.length > 0;

  const handleCheckoutSubmit = async ({
    deliveryAddress,
    deliveryAddressFlat,
    paymentMethod,
  }) => {
    setSubmitState({ isSubmitting: true, error: "", success: "" });
    try {
      const orderItems = purchasableLines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      }));
      await createOrderMutation.mutateAsync({
        items: orderItems,
        deliveryAddress,
        deliveryAddressFlat,
        paymentMethod,
      });
      clearCart();
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
      <div className="cart-page__empty">
        <p className="cart-page__state">{CART_PAGE_UI.EMPTY}</p>
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

  return (
    <div className="cart-page">
      <CartAuctionSection
        bids={auctionBids}
        defaultDeliveryAddress={defaultAddress}
        onCheckoutSuccess={onCheckoutSuccess}
      />

      {lines.length > 0 ? (
        <>
          <ul className="cart-page__list" role="list">
            {lines.map((line) => (
              <li key={line.productId} className="cart-page__item" role="listitem">
                <CartLineItem line={line} onProductClick={handleProductClick} />
              </li>
            ))}
          </ul>

          <div className="cart-page__summary">
            <span className="cart-page__total-label">{CART_PAGE_UI.TOTAL_LABEL}</span>
            <span className="cart-page__total-value">{formatPriceRub(total)}</span>
            <button type="button" className="cart-page__clear-button" onClick={clearCart}>
              {CART_PAGE_UI.CLEAR_ALL}
            </button>
          </div>
        </>
      ) : null}

      {isAuthorized ? (
        lines.length > 0 ? (
          <div className="cart-page__checkout-zone">
            <CheckoutForm
              defaultDeliveryAddress={defaultAddress}
              isSubmitting={submitState.isSubmitting}
              submitError={submitState.error}
              submitSuccess={submitState.success}
              onSubmit={handleCheckoutSubmit}
              isDisabled={!canCheckout}
            />
          </div>
        ) : null
      ) : (
        <div className="cart-page__auth-wall">
          <p>{CART_PAGE_UI.AUTH_REQUIRED}</p>
          <button
            type="button"
            className="cart-page__primary-action"
            onClick={onRequestLogin}
          >
            {CART_PAGE_UI.AUTH_LOGIN}
          </button>
        </div>
      )}
    </div>
  );
}
