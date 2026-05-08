import { useContext } from "react";

import { CartContext } from "./CartContext.jsx";

/**
 * Хук доступа к корзине. Бросает, если использован вне `<CartProvider>`.
 *
 * @returns {import('./types.js').CartContextValue}
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx == null) {
    throw new Error("useCart must be used within <CartProvider>");
  }
  return ctx;
}
