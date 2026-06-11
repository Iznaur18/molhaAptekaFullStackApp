export const WISHLIST_ACTION_ADD = "wishlist/add";
export const WISHLIST_ACTION_REMOVE = "wishlist/remove";
export const WISHLIST_ACTION_TOGGLE = "wishlist/toggle";
export const WISHLIST_ACTION_CLEAR = "wishlist/clear";
export const WISHLIST_ACTION_HYDRATE = "wishlist/hydrate";

const removeKey = (items, productId) => {
  const next = { ...items };
  delete next[productId];
  return next;
};

/**
 * @param {import('./types.js').WishlistItemsByProductId} state
 * @param {{ type: string; productId?: string; payload?: import('./types.js').WishlistItemsByProductId }} action
 * @returns {import('./types.js').WishlistItemsByProductId}
 */
export const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTION_ADD: {
      if (!action.productId || action.productId in state) return state;
      return { ...state, [action.productId]: Date.now() };
    }

    case WISHLIST_ACTION_REMOVE: {
      if (!action.productId) return state;
      return removeKey(state, action.productId);
    }

    case WISHLIST_ACTION_TOGGLE: {
      if (!action.productId) return state;
      if (action.productId in state) {
        return removeKey(state, action.productId);
      }
      return { ...state, [action.productId]: Date.now() };
    }

    case WISHLIST_ACTION_CLEAR:
      return {};

    case WISHLIST_ACTION_HYDRATE:
      return action.payload ?? {};

    default:
      return state;
  }
};
