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
/** Ступени курьера. */
export const ORDER_STATUS_COURIER_ASSIGNED = "courier_assigned";
export const ORDER_STATUS_COURIER_HOLDING = "courier_holding";
export const ORDER_STATUS_IN_DELIVERY = "in_delivery";
/** Товар вне контроля: разбирается модератором. */
export const ORDER_STATUS_DISPUTED = "disputed";

/**
 * Все статусы в порядке показа (фильтры, селекты). Значения совпадают с
 * `ORDER_STATUSES` в контракте и `server/constants/orderConstants.js`.
 */
export const ORDER_STATUSES = [
  ORDER_STATUS_PENDING,
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_STATUS_COURIER_ASSIGNED,
  ORDER_STATUS_COURIER_HOLDING,
  ORDER_STATUS_IN_DELIVERY,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
  ORDER_STATUS_DISPUTED,
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Подписи статусов — одни для сайта и приложения. */
export const ORDER_STATUS_LABEL_RU: Record<OrderStatus, string> = {
  [ORDER_STATUS_PENDING]: "В обработке",
  [ORDER_STATUS_ACCEPTED]: "Принят",
  [ORDER_STATUS_ASSEMBLING]: "На сборке",
  [ORDER_STATUS_READY_FOR_PICKUP]: "Готов к выдаче",
  [ORDER_STATUS_READY_TO_SHIP]: "Готов к отгрузке",
  [ORDER_STATUS_COURIER_ASSIGNED]: "Принят курьером",
  [ORDER_STATUS_COURIER_HOLDING]: "У курьера",
  [ORDER_STATUS_IN_DELIVERY]: "На доставке",
  [ORDER_STATUS_CONFIRMED]: "Подтверждён",
  [ORDER_STATUS_SHIPPED]: "Отправлен",
  [ORDER_STATUS_DELIVERED]: "Доставлен",
  [ORDER_STATUS_CANCELLED]: "Отменён",
  [ORDER_STATUS_RETURNED]: "Возвращён",
  [ORDER_STATUS_DISPUTED]: "Спор",
};

/**
 * Подписи статусов в «Мои продажи».
 *
 * Раньше продавцу `shipped` показывался как «Принят» — теперь «Принят» это
 * настоящая ступень лестницы, и два разных статуса под одной подписью
 * путали бы продавца.
 */
export const SALES_ORDER_STATUS_LABEL_RU: Record<OrderStatus, string> = {
  ...ORDER_STATUS_LABEL_RU,
  [ORDER_STATUS_SHIPPED]: "Отгружен",
};

/**
 * Ступени, которые продавец двигает кнопкой. Совпадает с
 * `ORDER_SHIPMENT_ADVANCE_STATUSES` в контракте.
 */
export const SHIPMENT_ADVANCE_BUTTON_LABEL_RU: Record<string, string> = {
  [ORDER_STATUS_ACCEPTED]: "Принять",
  [ORDER_STATUS_ASSEMBLING]: "На сборку",
  [ORDER_STATUS_READY_FOR_PICKUP]: "Готов к выдаче",
  [ORDER_STATUS_READY_TO_SHIP]: "Готов к отгрузке",
};

/** Товар ещё у продавца: отсюда можно и отменить, и отгрузить. */
export const ORDER_PRE_SHIPMENT_STATUSES: readonly string[] = [
  ORDER_STATUS_PENDING,
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
];

type OrderShipmentFulfillment = "pickup" | "delivery" | null | undefined;

/**
 * Следующая ступень отправления, или `null` если двигать некуда.
 *
 * Совпадает с `NEXT_STATUS_BY_CURRENT` в
 * `server/services/order/advanceShipmentStatus.js`. Сервер всё равно
 * проверяет переход сам — здесь только чтобы нарисовать нужную кнопку.
 */
export function resolveNextShipmentStatus(
  currentStatus: string | null | undefined,
  fulfillmentMethod: OrderShipmentFulfillment,
): string | null {
  if (currentStatus === ORDER_STATUS_PENDING) return ORDER_STATUS_ACCEPTED;
  if (currentStatus === ORDER_STATUS_ACCEPTED) return ORDER_STATUS_ASSEMBLING;
  if (currentStatus === ORDER_STATUS_ASSEMBLING) {
    return fulfillmentMethod === "delivery"
      ? ORDER_STATUS_READY_TO_SHIP
      : ORDER_STATUS_READY_FOR_PICKUP;
  }
  return null;
}

/** Подпись кнопки перехода, или `null` если кнопку показывать не нужно. */
export function resolveShipmentAdvanceAction(
  currentStatus: string | null | undefined,
  fulfillmentMethod: OrderShipmentFulfillment,
): { nextStatus: string; label: string } | null {
  const nextStatus = resolveNextShipmentStatus(currentStatus, fulfillmentMethod);
  if (!nextStatus) return null;

  const label = SHIPMENT_ADVANCE_BUTTON_LABEL_RU[nextStatus];
  return label ? { nextStatus, label } : null;
}

/** Совпадает с `ORDER_STATUS_LADDER_RANK` в `server/constants/orderConstants.js`. */
const LADDER_RANK: Record<string, number> = {
  [ORDER_STATUS_PENDING]: 0,
  [ORDER_STATUS_ACCEPTED]: 1,
  [ORDER_STATUS_ASSEMBLING]: 2,
  [ORDER_STATUS_READY_FOR_PICKUP]: 3,
  [ORDER_STATUS_READY_TO_SHIP]: 3,
  [ORDER_STATUS_COURIER_ASSIGNED]: 4,
  [ORDER_STATUS_COURIER_HOLDING]: 5,
  // Legacy `shipped` значит ровно «в пути» — тот же уровень, что и in_delivery.
  [ORDER_STATUS_SHIPPED]: 6,
  [ORDER_STATUS_IN_DELIVERY]: 6,
  [ORDER_STATUS_DELIVERED]: 7,
  [ORDER_STATUS_CONFIRMED]: 8,
};

/** Сделка по позиции закончилась: ни по лестнице, ни в счёт она не идёт. */
const TERMINAL_STATUSES = new Set([ORDER_STATUS_CANCELLED, ORDER_STATUS_RETURNED]);

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

  // Спор поднимается наверх: товар вне контроля, и это важнее того, на
  // какой ступени стоят остальные позиции.
  if (items.some((item) => String(item?.status) === ORDER_STATUS_DISPUTED)) {
    return ORDER_STATUS_DISPUTED;
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

  // Статус заказа — это статус самой отстающей живой позиции. Отменённая и
  // вернувшаяся из лестницы выпадают: продавец про них уже решил, и тянуть
  // ими весь заказ назад в «В обработке» нельзя — по этой ступени и клиент, и
  // сервер решают, какую кнопку показывать и какой переход разрешать.
  let leader: string | null = null;
  let leaderRank = Number.POSITIVE_INFINITY;
  for (const item of items) {
    const status = String(item?.status);
    if (TERMINAL_STATUSES.has(status)) continue;

    const rank = LADDER_RANK[status];
    if (rank === undefined) {
      return ORDER_STATUS_PENDING;
    }
    if (rank < leaderRank) {
      leaderRank = rank;
      leader = status;
    }
  }

  return leader ?? ORDER_STATUS_PENDING;
}

export type OrderItemsSummary = {
  /** Штук в заказе. */
  quantity: number;
  /** Сумма к оплате. */
  totalAmount: number;
  /** Сумма в баллах — у позиций товаров за баллы (рублей за них нет). */
  pointsTotal: number;
};

/**
 * Свод карточки заказа: сколько штук и на какую сумму.
 *
 * Отменённые и возвращённые позиции в свод не входят: покупатель за них не
 * платит, и после отмены карточка обязана показывать новую сумму, а не ту, с
 * которой заказ создавали.
 */
export function summarizeOrderItems(
  items:
    | Array<{
        status?: string;
        quantity?: number;
        unitPriceAtOrder?: number;
        buyNFreeUnitsAtOrder?: number;
        pointsPaidTotal?: number;
      }>
    | null
    | undefined,
): OrderItemsSummary {
  const billable = Array.isArray(items)
    ? items.filter((item) => !TERMINAL_STATUSES.has(String(item?.status)))
    : [];

  return {
    quantity: billable.reduce(
      (sum, item) => sum + Math.max(0, Math.floor(Number(item?.quantity) || 0)),
      0,
    ),
    totalAmount: calculateOrderItemsTotalAmount(billable),
    pointsTotal: billable.reduce(
      (sum, item) => sum + Math.max(0, Math.floor(Number(item?.pointsPaidTotal) || 0)),
      0,
    ),
  };
}

/**
 * Сумма позиций (как в getMySales / createOrder).
 * Учитывает `buyNFreeUnitsAtOrder` (бесплатные шт. в цикле «Бесплатно от N»).
 */
export function calculateOrderItemsTotalAmount(
  items:
    | Array<{
        quantity?: number;
        unitPriceAtOrder?: number;
        buyNFreeUnitsAtOrder?: number;
      }>
    | null
    | undefined,
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
