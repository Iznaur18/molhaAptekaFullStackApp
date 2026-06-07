import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { selectCartLines } from "../../../entities/cart/lib/selectCartLines.js";
import { useCart } from "../../../entities/cart/model/useCart.js";
import { useCreateOrderMutation } from "../../../entities/order/model/useCreateOrderMutation.js";
import { allProductsQueryKeys } from "../../../entities/product/model/allProductsQueryKeys.js";
import { useAllProductsQuery } from "../../../entities/product/model/useAllProductsQuery.js";
import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { CART_PAGE_UI, CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { CheckoutForm } from "../../../shared/ui/CheckoutForm/CheckoutForm.jsx";

import { CartLineItem } from "./CartLineItem.jsx";

import "./CartPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   currentUserId?: string | null;
 *   onRequestLogin: () => void;
 *   onGoToCatalog: () => void;
 *   onCheckoutSuccess: () => void;
 *   onSellerNameClick?: (userId: string) => void;
 * }} props
 */
export function CartPage({
  isAuthorized,
  currentUserId = null,
  onRequestLogin,
  onGoToCatalog,
  onCheckoutSuccess,
  onSellerNameClick,
}) {
  const { items, clearCart } = useCart();
  const queryClient = useQueryClient();
  const createOrderMutation = useCreateOrderMutation();
  const productsQuery = useAllProductsQuery();
  const { user } = useAuthSession();

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

  const patchProductStats = useCallback(
    (productId, patch) => {
      queryClient.setQueryData(allProductsQueryKeys.list({}), (old) => {
        if (!Array.isArray(old)) {
          return old;
        }
        return old.map((product) =>
          String(product._id) === productId ? { ...product, ...patch } : product,
        );
      });
    },
    [queryClient],
  );
  const [submitState, setSubmitState] = useState({
    isSubmitting: false,
    error: "",
    success: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductStatsUpdate = useCallback(
    (productId, stats) => {
      patchProductStats(productId, stats);
      setSelectedProduct((prev) =>
        prev && String(prev._id) === productId ? { ...prev, ...stats } : prev,
      );
    },
    [patchProductStats],
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

  const isCartEmpty = lines.length === 0;
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
      <ul className="cart-page__list" role="list">
        {lines.map((line) => (
          <li key={line.productId} className="cart-page__item" role="listitem">
            <CartLineItem line={line} onProductClick={setSelectedProduct} />
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

      {isAuthorized ? (
        <CheckoutForm
          defaultDeliveryAddress={defaultAddress}
          isSubmitting={submitState.isSubmitting}
          submitError={submitState.error}
          submitSuccess={submitState.success}
          onSubmit={handleCheckoutSubmit}
          isDisabled={!canCheckout}
        />
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
      <ProductDetailsModal
        isOpen={selectedProduct != null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSellerNameClick={onSellerNameClick}
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
        onProductStatsUpdate={handleProductStatsUpdate}
        showAddToCart={
          selectedProduct != null &&
          !isCurrentUserProductSeller(selectedProduct, currentUserId)
        }
        onRequestLogin={onRequestLogin}
      />
    </div>
  );
}
