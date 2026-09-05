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

export const ORDER_STATUS_PENDING = "pending" as const;
export const ORDER_STATUS_CONFIRMED = "confirmed" as const;
export const ORDER_STATUS_SHIPPED = "shipped" as const;
export const ORDER_STATUS_DELIVERED = "delivered" as const;
export const ORDER_STATUS_CANCELLED = "cancelled" as const;

export const ORDER_STATUSES = [
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CANCELLED,
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL_RU: Record<OrderStatus, string> = {
  [ORDER_STATUS_PENDING]: "В обработке",
  [ORDER_STATUS_CONFIRMED]: "Подтверждён",
  [ORDER_STATUS_SHIPPED]: "Отправлен",
  [ORDER_STATUS_DELIVERED]: "Доставлен",
  [ORDER_STATUS_CANCELLED]: "Отменён",
};

/** Лейблы статусов в «Мои продажи» (seller): shipped → «Принят». */
export const SALES_ORDER_STATUS_LABEL_RU: Record<OrderStatus, string> = {
  ...ORDER_STATUS_LABEL_RU,
  [ORDER_STATUS_SHIPPED]: "Принят",
};
