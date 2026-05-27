import { useEffect } from "react";

import { useCart } from "../../../entities/cart/model/useCart.js";
import { ADD_TO_CART_UI } from "../../../shared/config/appUiCopy.js";

import "./AddToCartButton.css";

/**
 * Кнопка добавления товара в корзину. Если товар уже в корзине — показывает stepper.
 * Без авторизации — предложение войти (корзина только на сервере для залогиненных).
 *
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   maxQuantity?: number;
 * }} props
 */
export function AddToCartButton({
  productId,
  isAuthorized,
  onRequestLogin,
  maxQuantity,
}) {
  const { items, addItem, setItemQuantity, removeItem } = useCart();
  const quantity = items[productId] ?? 0;
  const purchaseLimit =
    maxQuantity != null
      ? Math.max(0, Math.floor(Number(maxQuantity)) || 0)
      : null;

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
          addItem(productId, 1);
        }}
        disabled={purchaseLimit != null && purchaseLimit < 1}
      >
        {ADD_TO_CART_UI.ADD}
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
      <span
        className="add-to-cart__quantity"
        aria-label={ADD_TO_CART_UI.QUANTITY_ARIA}
      >
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
