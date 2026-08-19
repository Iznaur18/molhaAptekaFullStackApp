import { createContext, useCallback, useMemo, useReducer, useRef, useState } from "react";

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
  const [priceSnapshots, setPriceSnapshots] = useState(
    /** @type {Record<string, number>} */ ({}),
  );
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const replaceCartMutation = useReplaceMyCartMutation();

  const addItem = useCallback((productId, quantity = 1, unitPriceSnapshot) => {
    dispatch({ type: CART_ACTION_ADD, productId, quantity });
    if (unitPriceSnapshot == null) {
      return;
    }
    const snapshot = Math.floor(Number(unitPriceSnapshot));
    if (!Number.isFinite(snapshot) || snapshot < 0) {
      return;
    }
    setPriceSnapshots((prev) =>
      Object.prototype.hasOwnProperty.call(prev, productId)
        ? prev
        : { ...prev, [productId]: snapshot },
    );
  }, []);

  const setItemQuantity = useCallback((productId, quantity) => {
    dispatch({ type: CART_ACTION_SET_QUANTITY, productId, quantity });
  }, []);

  const removeItem = useCallback((productId) => {
    dispatch({ type: CART_ACTION_REMOVE, productId });
    setPriceSnapshots((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, productId)) {
        return prev;
      }
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const removeItems = useCallback((productIds) => {
    const idSet = new Set(productIds);
    if (idSet.size === 0) {
      return;
    }
    const next = { ...itemsRef.current };
    for (const productId of idSet) {
      delete next[productId];
    }
    dispatch({ type: CART_ACTION_HYDRATE, payload: next });
    setPriceSnapshots((prev) => {
      const snapshots = { ...prev };
      for (const productId of idSet) {
        delete snapshots[productId];
      }
      return snapshots;
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: CART_ACTION_CLEAR });
    setPriceSnapshots({});
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
      priceSnapshots,
      addItem,
      setItemQuantity,
      removeItem,
      removeItems,
      clearCart,
      hydrateCart,
      flushRemoteCart,
      totalCount,
    }),
    [
      items,
      priceSnapshots,
      addItem,
      setItemQuantity,
      removeItem,
      removeItems,
      clearCart,
      hydrateCart,
      flushRemoteCart,
      totalCount,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
