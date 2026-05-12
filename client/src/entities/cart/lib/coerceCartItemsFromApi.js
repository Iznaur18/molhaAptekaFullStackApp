/**
 * Приводит ответ API к виду productId → целое количество ≥ 1.
 *
 * @param {unknown} raw
 * @returns {import('../model/types.js').CartItemsByProductId}
 */
export function coerceCartItemsFromApi(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(raw).flatMap(([id, qty]) => {
      const key = String(id);
      const n = Math.floor(Number(qty));
      if (!Number.isFinite(n) || n < 1) {
        return [];
      }
      return [[key, n]];
    }),
  );
}
