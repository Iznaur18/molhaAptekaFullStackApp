/** Сколько символов ObjectId показывать как «номер» — хватает отличить заказы. */
const ORDER_NUMBER_DISPLAY_LENGTH = 8;

/**
 * Короткий номер заказа из `_id` (отдельного счётчика в модели нет).
 *
 * @param {unknown} orderId
 * @returns {string}
 */
export function formatOrderNumber(orderId) {
  const id = String(orderId ?? "").trim();
  if (!id) return "";
  return id.slice(-ORDER_NUMBER_DISPLAY_LENGTH).toUpperCase();
}
