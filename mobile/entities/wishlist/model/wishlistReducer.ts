import type { WishlistItemsByProductId } from "./types";

export const WISHLIST_ACTION_ADD = "wishlist/add";
export const WISHLIST_ACTION_REMOVE = "wishlist/remove";
export const WISHLIST_ACTION_TOGGLE = "wishlist/toggle";
export const WISHLIST_ACTION_CLEAR = "wishlist/clear";
export const WISHLIST_ACTION_HYDRATE = "wishlist/hydrate";

type WishlistAction =
  | { type: typeof WISHLIST_ACTION_ADD; productId: string }
  | { type: typeof WISHLIST_ACTION_REMOVE; productId: string }
  | { type: typeof WISHLIST_ACTION_TOGGLE; productId: string }
  | { type: typeof WISHLIST_ACTION_CLEAR }
  | { type: typeof WISHLIST_ACTION_HYDRATE; payload: WishlistItemsByProductId };

const removeKey = (items: WishlistItemsByProductId, productId: string) => {
  const next = { ...items };
  delete next[productId];
  return next;
};

export const wishlistReducer = (
  state: WishlistItemsByProductId,
  action: WishlistAction,
): WishlistItemsByProductId => {
  switch (action.type) {
    case WISHLIST_ACTION_ADD: {
      if (action.productId in state) {
        return state;
      }
      return { ...state, [action.productId]: Date.now() };
    }
    case WISHLIST_ACTION_REMOVE:
      return removeKey(state, action.productId);
    case WISHLIST_ACTION_TOGGLE:
      if (action.productId in state) {
        return removeKey(state, action.productId);
      }
      return { ...state, [action.productId]: Date.now() };
    case WISHLIST_ACTION_CLEAR:
      return {};
    case WISHLIST_ACTION_HYDRATE: {
      const payload = action.payload ?? {};
      const hasSameKeys =
        Object.keys(state).length === Object.keys(payload).length &&
        Object.keys(payload).every((key) => state[key] === payload[key]);
      return hasSameKeys ? state : payload;
    }
    default:
      return state;
  }
};
