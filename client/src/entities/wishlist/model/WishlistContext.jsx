import { createContext, useCallback, useMemo, useReducer, useRef } from "react";

import { useReplaceMyFavoritesMutation } from "./useReplaceMyFavoritesMutation.js";
import {
  WISHLIST_ACTION_ADD,
  WISHLIST_ACTION_CLEAR,
  WISHLIST_ACTION_HYDRATE,
  WISHLIST_ACTION_REMOVE,
  WISHLIST_ACTION_TOGGLE,
  wishlistReducer,
} from "./wishlistReducer.js";

/** @type {import('react').Context<import('./types.js').WishlistContextValue | null>} */
export const WishlistContext = createContext(null);

/**
 * @param {import('./types.js').WishlistItemsByProductId} items
 */
const countItems = (items) => Object.keys(items).length;

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(wishlistReducer, {});
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const replaceWishlistMutation = useReplaceMyFavoritesMutation();

  const addItem = useCallback((productId) => {
    dispatch({ type: WISHLIST_ACTION_ADD, productId: String(productId) });
  }, []);

  const removeItem = useCallback((productId) => {
    dispatch({ type: WISHLIST_ACTION_REMOVE, productId: String(productId) });
  }, []);

  const toggleItem = useCallback((productId) => {
    dispatch({ type: WISHLIST_ACTION_TOGGLE, productId: String(productId) });
  }, []);

  const clearWishlist = useCallback(() => {
    dispatch({ type: WISHLIST_ACTION_CLEAR });
  }, []);

  const hydrateWishlist = useCallback(
    /** @param {import('./types.js').WishlistItemsByProductId} payload */
    (payload) => {
      dispatch({ type: WISHLIST_ACTION_HYDRATE, payload });
    },
    [],
  );

  const flushRemoteWishlist = useCallback(async () => {
    try {
      await replaceWishlistMutation.mutateAsync(itemsRef.current);
    } catch {
      // выход не блокируем
    }
  }, [replaceWishlistMutation]);

  const isInWishlist = useCallback(
    (productId) => Object.prototype.hasOwnProperty.call(items, String(productId)),
    [items],
  );

  const totalCount = useMemo(() => countItems(items), [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      toggleItem,
      clearWishlist,
      hydrateWishlist,
      flushRemoteWishlist,
      isInWishlist,
      totalCount,
    }),
    [
      items,
      addItem,
      removeItem,
      toggleItem,
      clearWishlist,
      hydrateWishlist,
      flushRemoteWishlist,
      isInWishlist,
      totalCount,
    ],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
