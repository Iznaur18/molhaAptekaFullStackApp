/** Сколько символов ObjectId показывать как «номер» — хватает отличить заказы. */
const ORDER_NUMBER_DISPLAY_LENGTH = 8;

/**
 * Короткий номер заказа из `_id` (отдельного счётчика в модели нет).
 * Паритет web `formatOrderNumber.js`.
 */
export function formatOrderNumber(orderId: unknown): string {
  const id = String(orderId ?? "").trim();
  if (!id) return "";
  return id.slice(-ORDER_NUMBER_DISPLAY_LENGTH).toUpperCase();
}
