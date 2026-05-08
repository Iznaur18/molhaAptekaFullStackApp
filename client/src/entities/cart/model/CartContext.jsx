import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import {
  CART_ACTION_ADD,
  CART_ACTION_CLEAR,
  CART_ACTION_REMOVE,
  CART_ACTION_SET_QUANTITY,
  cartReducer,
} from "./cartReducer.js";
import { readCartFromStorage, writeCartToStorage } from "./cartStorage.js";

/** @type {import('react').Context<import('./types.js').CartContextValue | null>} */
export const CartContext = createContext(null);

const sumQuantities = (items) =>
  Object.values(items).reduce((sum, qty) => sum + qty, 0);

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(
    cartReducer,
    undefined,
    readCartFromStorage,
  );

  useEffect(() => {
    writeCartToStorage(items);
  }, [items]);

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

  const totalCount = useMemo(() => sumQuantities(items), [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      setItemQuantity,
      removeItem,
      clearCart,
      totalCount,
    }),
    [items, addItem, setItemQuantity, removeItem, clearCart, totalCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
