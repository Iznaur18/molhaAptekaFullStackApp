import type { CartItemsByProductId } from "../model/types";

export const countCartItems = (items: CartItemsByProductId): number =>
  Object.values(items).reduce((sum, qty) => sum + qty, 0);
