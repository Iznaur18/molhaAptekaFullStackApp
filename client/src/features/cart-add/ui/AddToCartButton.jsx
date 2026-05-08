import { useCart } from "../../../entities/cart/model/useCart.js";
import { ADD_TO_CART_UI } from "../../../shared/config/appUiCopy.js";

import "./AddToCartButton.css";

/**
 * Кнопка добавления товара в корзину. Если товар уже в корзине — показывает stepper.
 *
 * @param {{ productId: string }} props
 */
export function AddToCartButton({ productId }) {
  const { items, addItem, setItemQuantity, removeItem } = useCart();
  const quantity = items[productId] ?? 0;

  if (quantity === 0) {
    return (
      <button
        type="button"
        className="add-to-cart"
        onClick={() => addItem(productId, 1)}
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
        aria-label={ADD_TO_CART_UI.INCREASE_ARIA}
      >
        +
      </button>
    </div>
  );
}
