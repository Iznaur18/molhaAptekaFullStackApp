import {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

import { useReplaceMyFavoritesMutation } from "./useReplaceMyFavoritesMutation";
import {
  WISHLIST_ACTION_ADD,
  WISHLIST_ACTION_CLEAR,
  WISHLIST_ACTION_HYDRATE,
  WISHLIST_ACTION_REMOVE,
  WISHLIST_ACTION_TOGGLE,
  wishlistReducer,
} from "./wishlistReducer";
import type { WishlistContextValue, WishlistItemsByProductId } from "./types";
import { WishlistContext } from "./wishlistContext";

export { useWishlist } from "./useWishlist";

const countItems = (items: WishlistItemsByProductId) => Object.keys(items).length;

type WishlistProviderProps = {
  children: ReactNode;
};

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [items, dispatch] = useReducer(wishlistReducer, {});
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const replaceWishlistMutation = useReplaceMyFavoritesMutation();

  const addItem = useCallback((productId: string) => {
    dispatch({ type: WISHLIST_ACTION_ADD, productId: String(productId) });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: WISHLIST_ACTION_REMOVE, productId: String(productId) });
  }, []);

  const toggleItem = useCallback((productId: string) => {
    dispatch({ type: WISHLIST_ACTION_TOGGLE, productId: String(productId) });
  }, []);

  const clearWishlist = useCallback(() => {
    dispatch({ type: WISHLIST_ACTION_CLEAR });
  }, []);

  const hydrateWishlist = useCallback((payload: WishlistItemsByProductId) => {
    dispatch({ type: WISHLIST_ACTION_HYDRATE, payload });
  }, []);

  const flushRemoteWishlist = useCallback(async () => {
    try {
      await replaceWishlistMutation.mutateAsync(itemsRef.current);
    } catch {
      // выход не блокируем
    }
  }, [replaceWishlistMutation]);

  const isInWishlist = useCallback(
    (productId: string) => Object.prototype.hasOwnProperty.call(items, String(productId)),
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
      addItem,
      clearWishlist,
      flushRemoteWishlist,
      hydrateWishlist,
      isInWishlist,
      items,
      removeItem,
      toggleItem,
      totalCount,
    ],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
