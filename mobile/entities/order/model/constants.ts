export const ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY = "cashOnDelivery" as const;
export const ORDER_PAYMENT_METHOD_CARD_PREPAID = "cardPrepaid" as const;

export const ORDER_PAYMENT_METHODS = [
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
] as const;

export type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];

/**
 * Реально доступные покупателю. `cardPrepaid` заблокирован до эквайринга.
 */
export const ORDER_PAYMENT_METHODS_SELECTABLE: readonly OrderPaymentMethod[] = [
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
];

export const ORDER_PAYMENT_METHOD_DEFAULT: OrderPaymentMethod =
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY;

export const ORDER_PAYMENT_METHOD_LABEL_RU: Record<OrderPaymentMethod, string> = {
  [ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY]: "Наличными",
  // Значение в базе осталось `cardPrepaid`; способ у провайдера — СБП.
  [ORDER_PAYMENT_METHOD_CARD_PREPAID]: "СБП",
};

/**
 * Статусы заказа и их подписи — одни для сайта и приложения, источник в
 * `@izibuy/shared-lib`. Здесь реэкспорт, чтобы импорты по приложению не менялись.
 */
export {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
  SALES_ORDER_STATUS_LABEL_RU,
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_COURIER_ASSIGNED,
  ORDER_STATUS_COURIER_HOLDING,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_DISPUTED,
  ORDER_STATUS_IN_DELIVERY,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_STATUS_RETURNED,
  ORDER_STATUS_SHIPPED,
} from "@izibuy/shared-lib";
export type { OrderStatus } from "@izibuy/shared-lib";
