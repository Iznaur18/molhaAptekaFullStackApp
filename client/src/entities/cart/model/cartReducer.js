import {
  CART_LINE_ITEM_QUANTITY_MAX,
  CART_MAX_DISTINCT_PRODUCTS,
} from "./cartConstants.js";
import { ORDER_LINE_ITEM_QUANTITY_MIN } from "../../order/model/constants.js";

export const CART_ACTION_ADD = "cart/add";
export const CART_ACTION_SET_QUANTITY = "cart/setQuantity";
export const CART_ACTION_REMOVE = "cart/remove";
export const CART_ACTION_CLEAR = "cart/clear";
export const CART_ACTION_HYDRATE = "cart/hydrate";

const clampLineQuantity = (value) =>
  Math.min(
    CART_LINE_ITEM_QUANTITY_MAX,
    Math.max(
      ORDER_LINE_ITEM_QUANTITY_MIN,
      Math.floor(Number(value) || 0),
    ),
  );

const removeKey = (items, productId) => {
  const next = { ...items };
  delete next[productId];
  return next;
};

/**
 * @param {import('./types.js').CartItemsByProductId} state
 * @param {{ type: string; productId?: string; quantity?: number; payload?: import('./types.js').CartItemsByProductId }} action
 * @returns {import('./types.js').CartItemsByProductId}
 */
export const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTION_ADD: {
      if (!action.productId) return state;
      const rawDelta = Math.floor(Number(action.quantity ?? 1) || 1);
      const delta = Math.min(
        CART_LINE_ITEM_QUANTITY_MAX,
        Math.max(ORDER_LINE_ITEM_QUANTITY_MIN, rawDelta),
      );
      const isNew = !(action.productId in state);
      if (isNew && Object.keys(state).length >= CART_MAX_DISTINCT_PRODUCTS) {
        return state;
      }
      const current = state[action.productId] ?? 0;
      const merged = current + delta;
      const nextQty = Math.min(CART_LINE_ITEM_QUANTITY_MAX, merged);
      return { ...state, [action.productId]: nextQty };
    }

    case CART_ACTION_SET_QUANTITY: {
      if (!action.productId) return state;
      const next = clampLineQuantity(action.quantity ?? 0);
      if (next < ORDER_LINE_ITEM_QUANTITY_MIN) {
        return removeKey(state, action.productId);
      }
      return { ...state, [action.productId]: next };
    }

    case CART_ACTION_REMOVE:
      if (!action.productId) return state;
      return removeKey(state, action.productId);

    case CART_ACTION_CLEAR:
      return {};

    case CART_ACTION_HYDRATE:
      return action.payload ?? {};

    default:
      return state;
  }
};
