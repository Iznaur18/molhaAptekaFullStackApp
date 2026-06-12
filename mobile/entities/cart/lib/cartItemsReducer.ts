import {
  CART_LINE_ITEM_QUANTITY_MAX,
  CART_LINE_ITEM_QUANTITY_MIN,
  CART_MAX_DISTINCT_PRODUCTS,
} from "@/shared/config";

import type { CartItemsByProductId } from "../model/types";

const clampLineQuantity = (value: number) =>
  Math.min(
    CART_LINE_ITEM_QUANTITY_MAX,
    Math.max(CART_LINE_ITEM_QUANTITY_MIN, Math.floor(value) || 0),
  );

const removeKey = (items: CartItemsByProductId, productId: string): CartItemsByProductId => {
  const next = { ...items };
  delete next[productId];
  return next;
};

export const addCartItem = (
  items: CartItemsByProductId,
  productId: string,
  quantity = 1,
): CartItemsByProductId => {
  const delta = clampLineQuantity(quantity);
  const isNew = !(productId in items);
  if (isNew && Object.keys(items).length >= CART_MAX_DISTINCT_PRODUCTS) {
    return items;
  }
  const current = items[productId] ?? 0;
  const nextQty = Math.min(CART_LINE_ITEM_QUANTITY_MAX, current + delta);
  return { ...items, [productId]: nextQty };
};

export const setCartItemQuantity = (
  items: CartItemsByProductId,
  productId: string,
  quantity: number,
): CartItemsByProductId => {
  const next = clampLineQuantity(quantity);
  if (next < CART_LINE_ITEM_QUANTITY_MIN) {
    return removeKey(items, productId);
  }
  return { ...items, [productId]: next };
};

export const removeCartItem = (
  items: CartItemsByProductId,
  productId: string,
): CartItemsByProductId => removeKey(items, productId);

export const clearCartItems = (): CartItemsByProductId => ({});
