import { createContext, useCallback, useMemo, useReducer, useRef } from "react";

import { useReplaceMyCartMutation } from "./useReplaceMyCartMutation.js";
import {
  CART_ACTION_ADD,
  CART_ACTION_CLEAR,
  CART_ACTION_HYDRATE,
  CART_ACTION_REMOVE,
  CART_ACTION_SET_QUANTITY,
  cartReducer,
} from "./cartReducer.js";

/** @type {import('react').Context<import('./types.js').CartContextValue | null>} */
export const CartContext = createContext(null);

const sumQuantities = (items) =>
  Object.values(items).reduce((sum, qty) => sum + Math.floor(Number(qty) || 0), 0);

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, {});
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const replaceCartMutation = useReplaceMyCartMutation();

  const addItem = useCallback((productId, quantity = 1) => {
    dispatch({ type: CART_ACTION_ADD, productId, quantity });
  }, []);

  const setItemQuantity = useCallback((productId, quantity) => {
    dispatch({ type: CART_ACTION_SET_QUANTITY, productId, quantity });
  }, []);

  const removeItem = useCallback((productId) => {
    dispatch({ type: CART_ACTION_REMOVE, productId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: CART_ACTION_CLEAR });
  }, []);

  const hydrateCart = useCallback(
    /** @param {import('./types.js').CartItemsByProductId} payload */
    (payload) => {
      dispatch({ type: CART_ACTION_HYDRATE, payload });
    },
    [],
  );

  /** Сохранить текущую корзину на сервер (cookie auth). */
  const flushRemoteCart = useCallback(async () => {
    try {
      await replaceCartMutation.mutateAsync(itemsRef.current);
    } catch {
      // выход не блокируем
    }
  }, [replaceCartMutation]);

  const totalCount = useMemo(() => sumQuantities(items), [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      setItemQuantity,
      removeItem,
      clearCart,
      hydrateCart,
      flushRemoteCart,
      totalCount,
    }),
    [
      items,
      addItem,
      setItemQuantity,
      removeItem,
      clearCart,
      hydrateCart,
      flushRemoteCart,
      totalCount,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
