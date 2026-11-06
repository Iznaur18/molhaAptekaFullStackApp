import {
  PRODUCT_DELIVERY_CARRIER_SELLER,
  resolveOrderPrepaymentAmountRub,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";
import {
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_STATUS_SHIPPED,
  buildOrderStatusFromItems,
  canCancelOrderShipment,
  isOrderAwaitingPrepayment,
  isOrderShipmentTrackedByCarrier,
  resolveOrderLineSellerId,
  resolveShipmentAdvanceAction,
} from "@izibuy/shared-lib";

type ShipmentActionsLine = {
  status?: string;
  itemIndex?: number;
  productId?: unknown;
  sellerIdAtOrder?: unknown;
};

type ShipmentActionsOrder = {
  paymentMethod?: string | null;
  prepaidPaidAt?: unknown;
  prepaymentDueAt?: unknown;
  totalAmount?: number | null;
  fulfillmentMethod?: string | null;
  items?: ShipmentActionsLine[] | null;
  // Отправления приходят из API как есть (passthrough) — поля читаем бережно.
  shipments?: Array<Record<string, unknown>> | null;
};

export type OrderShipmentActions = {
  /** Заказ с предоплатой, деньги ещё не пришли. */
  awaitingPrepayment: boolean;
  /** Продавец ещё не подтвердил — платить рано. */
  awaitingSellerAccept: boolean;
  /** Продавец подтвердил — покупатель может платить. */
  awaitingPaymentAfterAccept: boolean;
  /** Сумма на кнопке «Оплатить»: та же формула, что у счёта на сервере. */
  prepaymentAmountRub: number;
  /** До какого момента оплатить; после него сервер отменит заказ. */
  prepaymentDueAt: string | null;
  /** Следующая ступень сборки, которую двигает продавец. */
  advance: { nextStatus: string; label: string } | null;
  /** Доставка продавцом: позиции «Готов к отгрузке» — их отгружают. */
  shipItemIndexes: number[];
  /** Доставка продавцом: позиции «Отгружен» — их отмечают доставленными. */
  deliverItemIndexes: number[];
  /** Самовывоз: позиции «Готов к выдаче» — их выдают покупателю. */
  handOverItemIndexes: number[];
  /** Продавец отправления: им адресуется «Отменить заказ». */
  sellerId: string;
  /** Отправление ведёт служба (СДЭК, Яндекс): возврат она отмечает сама. */
  carrierTracksShipment: boolean;
  /** Все живые позиции ещё у продавца — заказ можно снять целиком. */
  canCancelOrder: boolean;
};

const itemIndexesInStatus = (items: ShipmentActionsLine[], status: string): number[] =>
  items
    .map((item, index) => ({
      itemIndex: typeof item.itemIndex === "number" ? item.itemIndex : index,
      status: item.status,
    }))
    .filter((row) => row.status === status)
    .map((row) => row.itemIndex);

/**
 * Что можно сделать с отправлением в карточке заказа — паритет с web
 * `OrderCard.jsx`. Сервер всё равно проверяет каждый переход сам; здесь
 * только чтобы не рисовать кнопку, которую он отклонит.
 *
 * Отправление = заказ + продавец: в «Моих продажах» карточка — кусок заказа
 * одного продавца, поэтому продавца берём с первой позиции.
 */
export function resolveOrderShipmentActions(
  order: ShipmentActionsOrder | null | undefined,
  role: "buyer" | "seller",
): OrderShipmentActions {
  const items = Array.isArray(order?.items) ? order.items : [];
  const cardSellerId = items.length > 0 ? resolveOrderLineSellerId(items[0]) : "";
  const shipmentOwn =
    (Array.isArray(order?.shipments) ? order.shipments : []).find(
      (row) => row?.sellerId != null && String(row.sellerId) === cardSellerId,
    ) ?? null;

  // Способ берём с отправления, а на заказах до отправлений — с общего поля.
  const shipmentMethod =
    (shipmentOwn?.fulfillmentMethod as string | undefined) ?? order?.fulfillmentMethod;
  const isDelivery = shipmentMethod === "delivery";
  const carrier = resolveProductDeliveryCarrier({
    productDeliveryCarrier: shipmentOwn?.deliveryCarrier as string | undefined,
    productCourierDeliveryEnabled: shipmentOwn?.courierDelivery === true,
    productDeliveryEnabled: isDelivery,
  });
  // СДЭК, Яндекс и «Экспресс»: «Отгружен» и «Доставлен» ставит опрос статусов
  // службы, не продавец. Их нет среди перевозчиков товара, поэтому резолвер
  // выше принял бы такое отправление за доставку продавцом.
  const carrierTracksShipment = isOrderShipmentTrackedByCarrier({
    fulfillment: shipmentMethod,
    deliveryCarrier: shipmentOwn?.deliveryCarrier as string | undefined,
  });
  // ЛОБО и курьеры площадки резолвер различает сам — у них свой перевозчик.
  const sellerDelivers =
    isDelivery && carrier === PRODUCT_DELIVERY_CARRIER_SELLER && !carrierTracksShipment;

  const statusNow = buildOrderStatusFromItems(items);
  // Отменённый заказ платить не нужно: без этой проверки у него висели
  // «Ожидает оплаты» и «Оплатить» — отметки об оплате у него так и нет.
  const awaitingPrepayment =
    isOrderAwaitingPrepayment(order) && statusNow !== ORDER_STATUS_CANCELLED;
  // Оплата открывается после подтверждения продавцом: сначала он проверяет,
  // что товар есть, и только потом покупатель платит.
  const acceptedBySeller = statusNow !== ORDER_STATUS_PENDING;
  const dueRaw = order?.prepaymentDueAt;

  const isSeller = role === "seller";
  const advanceCandidate = isSeller
    ? resolveShipmentAdvanceAction(statusNow, isDelivery ? "delivery" : "pickup")
    : null;
  // Подтвердить заказ продавец может и до оплаты — это его «товар есть».
  // Всё, что дальше по лестнице, сервер отклонит: мёртвая кнопка хуже, чем
  // её отсутствие.
  const advance =
    advanceCandidate &&
    awaitingPrepayment &&
    advanceCandidate.nextStatus !== ORDER_STATUS_ACCEPTED
      ? null
      : advanceCandidate;
  const sellerCanMove = isSeller && !awaitingPrepayment;

  return {
    awaitingPrepayment,
    awaitingSellerAccept: awaitingPrepayment && !acceptedBySeller,
    awaitingPaymentAfterAccept: awaitingPrepayment && acceptedBySeller,
    prepaymentAmountRub: resolveOrderPrepaymentAmountRub(order),
    prepaymentDueAt: typeof dueRaw === "string" && dueRaw ? dueRaw : null,
    advance,
    shipItemIndexes:
      sellerCanMove && sellerDelivers
        ? itemIndexesInStatus(items, ORDER_STATUS_READY_TO_SHIP)
        : [],
    deliverItemIndexes:
      sellerCanMove && sellerDelivers
        ? itemIndexesInStatus(items, ORDER_STATUS_SHIPPED)
        : [],
    handOverItemIndexes:
      sellerCanMove && !isDelivery
        ? itemIndexesInStatus(items, ORDER_STATUS_READY_FOR_PICKUP)
        : [],
    sellerId: cardSellerId,
    carrierTracksShipment,
    canCancelOrder: canCancelOrderShipment({ sellerId: cardSellerId, items }),
  };
}
