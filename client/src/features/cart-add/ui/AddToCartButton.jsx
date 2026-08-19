import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../../entities/cart/model/useCart.js";
import { ADD_TO_CART_UI } from "../../../shared/config/appUiCopy.js";
import { HOME_MAIN_VIEW_PATH } from "../../../shared/lib/homeMainViewPaths.js";

import "./AddToCartButton.css";

/**
 * Кнопка добавления товара в корзину.
 * `variant="detail"`: после добавления — зелёная «Перейти в корзину» (без stepper).
 * Иначе при qty > 0 — stepper.
 *
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   maxQuantity?: number;
 *   unitPriceSnapshot?: number;
 *   variant?: 'default' | 'detail';
 * }} props
 */
export function AddToCartButton({
  productId,
  isAuthorized,
  onRequestLogin,
  maxQuantity,
  unitPriceSnapshot,
  variant = "default",
}) {
  const navigate = useNavigate();
  const { items, addItem, setItemQuantity, removeItem } = useCart();
  const quantity = items[productId] ?? 0;
  const purchaseLimit =
    maxQuantity != null ? Math.max(0, Math.floor(Number(maxQuantity)) || 0) : null;
  const isDetail = variant === "detail";

  useEffect(() => {
    if (purchaseLimit == null || quantity <= purchaseLimit) {
      return;
    }
    setItemQuantity(productId, purchaseLimit);
  }, [productId, purchaseLimit, quantity, setItemQuantity]);

  if (!isAuthorized) {
    return (
      <button
        type="button"
        className="add-to-cart add-to-cart--login"
        onClick={onRequestLogin}
      >
        {ADD_TO_CART_UI.LOGIN_TO_ADD}
      </button>
    );
  }

  if (quantity === 0) {
    return (
      <button
        type="button"
        className="add-to-cart"
        onClick={() => {
          if (purchaseLimit != null && purchaseLimit < 1) return;
          addItem(productId, 1, unitPriceSnapshot);
        }}
        disabled={purchaseLimit != null && purchaseLimit < 1}
      >
        {ADD_TO_CART_UI.ADD}
      </button>
    );
  }

  if (isDetail) {
    return (
      <button
        type="button"
        className="add-to-cart add-to-cart--in-cart"
        onClick={() => {
          navigate(HOME_MAIN_VIEW_PATH.cart);
        }}
      >
        {ADD_TO_CART_UI.GO_TO_CART}
      </button>
    );
  }

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeItem(productId);
      return;
    }
    setItemQuantity(productId, quantity - 1);
  };

  const handleIncrease = () => {
    if (purchaseLimit != null && quantity >= purchaseLimit) {
      return;
    }
    setItemQuantity(productId, quantity + 1);
  };

  return (
    <div className="add-to-cart__stepper" role="group">
      <button
        type="button"
        className="add-to-cart__step-button"
        onClick={handleDecrease}
        aria-label={ADD_TO_CART_UI.DECREASE_ARIA}
      >
        −
      </button>
      <span className="add-to-cart__quantity" aria-label={ADD_TO_CART_UI.QUANTITY_ARIA}>
        {quantity}
      </span>
      <button
        type="button"
        className="add-to-cart__step-button"
        onClick={handleIncrease}
        disabled={purchaseLimit != null && quantity >= purchaseLimit}
        aria-label={ADD_TO_CART_UI.INCREASE_ARIA}
      >
        +
      </button>
    </div>
  );
}
