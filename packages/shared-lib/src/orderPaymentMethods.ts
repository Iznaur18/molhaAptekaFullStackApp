/** Способы оплаты — совпадают с `enum` в `server/constants/orderConstants.js`. */
export const ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY = "cashOnDelivery";
/** Значение в базе осталось `cardPrepaid` — это предоплата через площадку по СБП. */
export const ORDER_PAYMENT_METHOD_CARD_PREPAID = "cardPrepaid";
/** Перевод продавцу при получении — платформа денег не касается. */
export const ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY = "cardOnDelivery";

export const ORDER_PAYMENT_METHODS = [
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
] as const;

export type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];

/**
 * Способы, доступные любому продавцу. Предоплата сюда не входит: она
 * открывается отдельно, см. `isCardPrepaidAvailableForSellers`.
 */
export const ORDER_PAYMENT_METHODS_SELECTABLE: readonly OrderPaymentMethod[] = [
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
];

/** Способ оплаты по умолчанию в формах чекаута. */
export const ORDER_PAYMENT_METHOD_DEFAULT: OrderPaymentMethod =
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY;

export const ORDER_PAYMENT_METHOD_LABEL_RU: Record<OrderPaymentMethod, string> = {
  [ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY]: "Наличными",
  // Способ у провайдера строго СБП, и подпись должна обещать то, что
  // покупатель реально увидит.
  [ORDER_PAYMENT_METHOD_CARD_PREPAID]: "СБП",
  [ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY]: "Картой при получении",
};

/**
 * Способы оплаты, доступные покупателю на этом оформлении.
 *
 * Продавец решает, что он принимает; покупатель видит только это. Пустой
 * список у продавца означает «не настраивал» — тогда принимает всё, иначе у
 * каждого, кто завёлся до появления настройки, чекаут остался бы без кнопок.
 *
 * Пересечение по группам, а не объединение: если групп несколько, показать
 * способ, который примет только один из них, — значит пообещать то, что
 * сервер отклонит.
 */
export function resolveCartAllowedPaymentMethods(
  sellerGroups:
    | ReadonlyArray<{ sellerPaymentMethods?: readonly string[] | null } | null>
    | null
    | undefined,
): OrderPaymentMethod[] {
  const groups = Array.isArray(sellerGroups) ? sellerGroups : [];
  if (groups.length === 0) {
    return [...ORDER_PAYMENT_METHODS];
  }

  return ORDER_PAYMENT_METHODS.filter((method) =>
    groups.every((group) => {
      const methods = Array.isArray(group?.sellerPaymentMethods)
        ? group.sellerPaymentMethods
        : [];
      return methods.length === 0 || methods.includes(method);
    }),
  );
}

/**
 * Можно ли платить по СБП заранее за эту корзину.
 *
 * Пока деньги идут на счёт площадки, предоплата доступна только за товар
 * продавцов из списка `cardPrepaidSellerIds` (`GET /payments/config`).
 */
export function isCardPrepaidAvailableForSellers(
  cardPrepaidSellerIds: ReadonlyArray<unknown> | null | undefined,
  sellerIds: ReadonlyArray<unknown> | null | undefined,
): boolean {
  const allowed = Array.isArray(cardPrepaidSellerIds) ? cardPrepaidSellerIds : [];
  const sellers = Array.isArray(sellerIds) ? sellerIds : [];
  if (allowed.length === 0 || sellers.length === 0) {
    return false;
  }
  const allowedSet = new Set(allowed.map(String));
  return sellers.every((id) => allowedSet.has(String(id)));
}

export type CheckoutPaymentMethodOptions = {
  /** Что показываем, в порядке показа: сначала доступные. */
  orderedMethods: OrderPaymentMethod[];
  /** Что покупатель может выбрать. */
  availableMethods: OrderPaymentMethod[];
  /**
   * Способ площадка умеет, но этот продавец его не принимает. Для остальных
   * заблокированных причина — «скоро».
   */
  notAcceptedBySeller: OrderPaymentMethod[];
};

/**
 * Что показать в выборе способа оплаты.
 *
 * Продавец сужает то, что вообще умеет площадка, но не расширяет: предоплата
 * без эквайринга не заработает от его галочки. Порядок постоянный: сначала
 * доступные, потом недоступные, внутри — как в списке способов. Скрытые (при
 * курьере площадки — наличные) не показываем вовсе.
 */
export function resolveCheckoutPaymentMethodOptions({
  cardPrepaidAvailable = false,
  allowedMethods = null,
  hiddenMethods = [],
}: {
  cardPrepaidAvailable?: boolean;
  allowedMethods?: readonly string[] | null;
  hiddenMethods?: readonly string[];
} = {}): CheckoutPaymentMethodOptions {
  const platformSelectable = new Set<OrderPaymentMethod>(
    cardPrepaidAvailable
      ? [...ORDER_PAYMENT_METHODS_SELECTABLE, ORDER_PAYMENT_METHOD_CARD_PREPAID]
      : ORDER_PAYMENT_METHODS_SELECTABLE,
  );
  const selectable = Array.isArray(allowedMethods)
    ? new Set(
        [...platformSelectable].filter((method) => allowedMethods.includes(method)),
      )
    : platformSelectable;

  const visible = ORDER_PAYMENT_METHODS.filter(
    (method) => !hiddenMethods.includes(method),
  );
  const orderedMethods = [
    ...visible.filter((method) => selectable.has(method)),
    ...visible.filter((method) => !selectable.has(method)),
  ];

  return {
    orderedMethods,
    availableMethods: orderedMethods.filter((method) => selectable.has(method)),
    notAcceptedBySeller: orderedMethods.filter(
      (method) => !selectable.has(method) && platformSelectable.has(method),
    ),
  };
}

/**
 * Заказ оформлен с предоплатой, а деньги ещё не пришли: продавец не собирает,
 * покупатель платит — но только после того, как продавец подтвердил заказ.
 */
export function isOrderAwaitingPrepayment(
  order: { paymentMethod?: string | null; prepaidPaidAt?: unknown } | null | undefined,
): boolean {
  return (
    order?.paymentMethod === ORDER_PAYMENT_METHOD_CARD_PREPAID && !order?.prepaidPaidAt
  );
}
