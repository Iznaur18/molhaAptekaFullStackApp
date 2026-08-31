export const ORDER_STATUS_PENDING = "pending";
export const ORDER_STATUS_CONFIRMED = "confirmed";
export const ORDER_STATUS_SHIPPED = "shipped";
export const ORDER_STATUS_DELIVERED = "delivered";
export const ORDER_STATUS_CANCELLED = "cancelled";
/** Товар уехал и вернулся: отказ у двери, неудачное вручение. */
export const ORDER_STATUS_RETURNED = "returned";
/** Ступени сборки, общие для самовывоза и доставки. */
export const ORDER_STATUS_ACCEPTED = "accepted";
export const ORDER_STATUS_ASSEMBLING = "assembling";
/** Развилка лестниц: самовывоз ждут на точке, доставку — отгружают. */
export const ORDER_STATUS_READY_FOR_PICKUP = "ready_for_pickup";
export const ORDER_STATUS_READY_TO_SHIP = "ready_to_ship";

/** Совпадает с `ORDER_STATUS_LADDER_RANK` в `server/constants/orderConstants.js`. */
const LADDER_RANK: Record<string, number> = {
  [ORDER_STATUS_PENDING]: 0,
  [ORDER_STATUS_ACCEPTED]: 1,
  [ORDER_STATUS_ASSEMBLING]: 2,
  [ORDER_STATUS_READY_FOR_PICKUP]: 3,
  [ORDER_STATUS_READY_TO_SHIP]: 3,
  [ORDER_STATUS_SHIPPED]: 4,
  [ORDER_STATUS_DELIVERED]: 5,
  [ORDER_STATUS_CONFIRMED]: 6,
};

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

  // Статус заказа — это статус самой отстающей активной позиции. Терминальная
  // позиция рядом с активной означает, что заказ ещё в работе.
  let leader: string | null = null;
  let leaderRank = Number.POSITIVE_INFINITY;
  for (const item of items) {
    const rank = LADDER_RANK[String(item?.status)];
    if (rank === undefined) {
      return ORDER_STATUS_PENDING;
    }
    if (rank < leaderRank) {
      leaderRank = rank;
      leader = String(item.status);
    }
  }

  return leader ?? ORDER_STATUS_PENDING;
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
