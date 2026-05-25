import { useEffect, useMemo, useState, useCallback } from "react";

import { selectCartLines } from "../../../entities/cart/lib/selectCartLines.js";
import { useCart } from "../../../entities/cart/model/useCart.js";
import { createOrder } from "../../../entities/order/api/createOrder.js";
import { fetchAllProducts } from "../../../entities/product/api/fetchAllProducts.js";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";
import {
  CART_PAGE_UI,
  CHECKOUT_FORM_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import { CartLineItem } from "./CartLineItem.jsx";
import { CheckoutForm } from "./CheckoutForm.jsx";

import "./CartPage.css";

const useCatalogProducts = () => {
  const [phase, setPhase] = useState("loading");
  const [products, setProducts] = useState(
    /** @type {import('../../../entities/product/model/types.js').ProductFromApi[]} */ ([]),
  );
  const [error, setError] = useState("");

  const patchProductStats = useCallback((productId, patch) => {
    setProducts((prev) =>
      prev.map((p) =>
        String(p._id) === productId ? { ...p, ...patch } : p,
      ),
    );
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        const list = await fetchAllProducts();
        if (isCancelled) return;
        setProducts(list);
        setPhase("success");
      } catch (e) {
        if (isCancelled) return;
        setError(e instanceof Error ? e.message : CART_PAGE_UI.LOADING);
        setPhase("error");
      }
    };

    void load();
    return () => {
      isCancelled = true;
    };
  }, []);

  return { phase, products, error, patchProductStats };
};

const useCurrentUserAddress = (isAuthorized) => {
  const [address, setAddress] = useState(
    /** @type {Partial<{ userAddress?: string; userAddressFlat?: string; userAddressFiasId?: string; userAddressGeo?: { lat?: number; lon?: number } | null }>} */ ({}),
  );

  useEffect(() => {
    if (!isAuthorized) {
      setAddress({});
      return undefined;
    }
    let isCancelled = false;

    void (async () => {
      try {
        const { user: me } = await fetchCurrentUserProfile();
        if (isCancelled) return;
        setAddress({
          userAddress: me?.userAddress,
          userAddressFlat: me?.userAddressFlat,
          userAddressFiasId: me?.userAddressFiasId,
          userAddressGeo: me?.userAddressGeo,
        });
      } catch {
        if (!isCancelled) setAddress({});
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized]);

  return address;
};

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   onGoToCatalog: () => void;
 *   onCheckoutSuccess: () => void;
 *   onSellerNameClick?: (userId: string) => void;
 * }} props
 */
export function CartPage({
  isAuthorized,
  onRequestLogin,
  onGoToCatalog,
  onCheckoutSuccess,
  onSellerNameClick,
}) {
  const { items, clearCart } = useCart();
  const { phase, products, error, patchProductStats } = useCatalogProducts();
  const defaultAddress = useCurrentUserAddress(isAuthorized);
  const [submitState, setSubmitState] = useState({
    isSubmitting: false,
    error: "",
    success: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductStatsUpdate = useCallback((productId, stats) => {
    patchProductStats(productId, stats);
    setSelectedProduct((prev) =>
      prev && String(prev._id) === productId ? { ...prev, ...stats } : prev,
    );
  }, [patchProductStats]);

  const { lines, total } = useMemo(
    () => selectCartLines(items, products),
    [items, products],
  );

  const purchasableLines = useMemo(
    () =>
      lines.filter(
        (line) => !line.isMissing && line.product?.productIsAvailable !== false,
      ),
    [lines],
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
      await createOrder({
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
        <span className="cart-page__total-label">
          {CART_PAGE_UI.TOTAL_LABEL}
        </span>
        <span className="cart-page__total-value">{formatPriceRub(total)}</span>
        <button
          type="button"
          className="cart-page__clear-button"
          onClick={clearCart}
        >
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
        onProductStatsUpdate={handleProductStatsUpdate}
      />
    </div>
  );
}
