export const ORDER_STATUS_PENDING = "pending";
export const ORDER_STATUS_CONFIRMED = "confirmed";
export const ORDER_STATUS_SHIPPED = "shipped";
export const ORDER_STATUS_DELIVERED = "delivered";
export const ORDER_STATUS_CANCELLED = "cancelled";
/** Товар уехал и вернулся: отказ у двери, неудачное вручение. */
export const ORDER_STATUS_RETURNED = "returned";

const EVERY_IN = (
  items: Array<{ status?: string }>,
  allowedSet: Set<string>,
): boolean =>
  items.length > 0 && items.every((item) => allowedSet.has(String(item.status)));

/**
 * Rollup статуса заказа/блока по позициям.
 * Совпадает с `server/services/order/orderStatus.js` → `buildOrderStatusFromItems`.
 */
export function buildOrderStatusFromItems(
  items: Array<{ status?: string }> | null | undefined,
): string {
  if (!Array.isArray(items) || items.length === 0) {
    return ORDER_STATUS_PENDING;
  }

  if (EVERY_IN(items, new Set([ORDER_STATUS_CONFIRMED]))) {
    return ORDER_STATUS_CONFIRMED;
  }
  if (EVERY_IN(items, new Set([ORDER_STATUS_DELIVERED, ORDER_STATUS_CONFIRMED]))) {
    return ORDER_STATUS_DELIVERED;
  }
  if (
    EVERY_IN(
      items,
      new Set([ORDER_STATUS_SHIPPED, ORDER_STATUS_DELIVERED, ORDER_STATUS_CONFIRMED]),
    )
  ) {
    return ORDER_STATUS_SHIPPED;
  }
  if (EVERY_IN(items, new Set([ORDER_STATUS_RETURNED]))) {
    return ORDER_STATUS_RETURNED;
  }
  if (EVERY_IN(items, new Set([ORDER_STATUS_CANCELLED]))) {
    return ORDER_STATUS_CANCELLED;
  }
  // Часть отменили до отправки, часть вернулась: сделка не состоялась целиком.
  if (EVERY_IN(items, new Set([ORDER_STATUS_CANCELLED, ORDER_STATUS_RETURNED]))) {
    return ORDER_STATUS_CANCELLED;
  }
  return ORDER_STATUS_PENDING;
}

/**
 * Сумма позиций (как в getMySales / createOrder).
 * Учитывает `buyNFreeUnitsAtOrder` (бесплатные шт. в цикле «Бесплатно от N»).
 */
export function calculateOrderItemsTotalAmount(
  items: Array<{
    quantity?: number;
    unitPriceAtOrder?: number;
    buyNFreeUnitsAtOrder?: number;
  }> | null | undefined,
): number {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  let sum = 0;
  for (const item of items) {
    const quantity = Math.max(0, Math.floor(Number(item?.quantity) || 0));
    const freeUnits = Math.min(
      quantity,
      Math.max(0, Math.floor(Number(item?.buyNFreeUnitsAtOrder) || 0)),
    );
    const unitPrice = Math.max(0, Math.floor(Number(item?.unitPriceAtOrder) || 0));
    sum += unitPrice * (quantity - freeUnits);
  }
  return sum;
}
