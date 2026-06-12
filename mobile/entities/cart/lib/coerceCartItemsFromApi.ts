import type { CartItemsByProductId } from "../model/types";

export const coerceCartItemsFromApi = (raw: unknown): CartItemsByProductId => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(raw).flatMap(([id, qty]) => {
      const key = String(id);
      const quantity = Math.floor(Number(qty));
      if (!Number.isFinite(quantity) || quantity < 1) {
        return [];
      }
      return [[key, quantity]];
    }),
  );
};
