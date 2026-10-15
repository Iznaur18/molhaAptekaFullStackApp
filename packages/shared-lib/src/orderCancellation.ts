import {
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
  SHIPPING_PROVIDER_YANDEX_EXPRESS,
} from "@molha/api-contract";

import {
  ORDER_PRE_SHIPMENT_STATUSES,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
} from "./orderStatus.js";
import { MY_ORDER_UNKNOWN_SELLER_ID } from "./projectMyOrderSellerBlocks.js";

/**
 * Отмена и возврат в карточке заказа (web и приложение). Зеркалят серверные
 * правила `cancelOrderItems.js` и `updateOrderItemStatus.js`: мёртвая кнопка,
 * на которую сервер ответит 409, путала бы и покупателя, и продавца.
 */

const PRE_SHIPMENT_STATUSES = new Set<string>(ORDER_PRE_SHIPMENT_STATUSES);

type OrderItemLike = { status?: string | null } | null | undefined;

/** Позицию можно отменить, пока товар у продавца. */
export function canCancelOrderItem(status: string | null | undefined): boolean {
  return typeof status === "string" && PRE_SHIPMENT_STATUSES.has(status);
}

/**
 * Можно ли снять заказ продавца целиком одной кнопкой: только пока все живые
 * позиции у продавца. Уехавшая позиция оформляется возвратом.
 *
 * Отправление адресуется id продавца, поэтому позиции без продавца
 * (legacy-заказы) кнопку не получают: сервер такой заказ не найдёт.
 */
export function canCancelOrderShipment({
  sellerId,
  items,
}: {
  sellerId?: string | null;
  items?: readonly OrderItemLike[] | null;
}): boolean {
  if (!sellerId || sellerId === MY_ORDER_UNKNOWN_SELLER_ID) return false;

  const alive = (items ?? []).filter((item) => item?.status !== ORDER_STATUS_CANCELLED);

  return alive.length > 0 && alive.every((item) => canCancelOrderItem(item?.status));
}

/**
 * Отправление везёт служба со своим трекингом (СДЭК, Яндекс): возврат она
 * отмечает сама, когда посылка вернулась к продавцу.
 */
export function isOrderShipmentTrackedByCarrier({
  fulfillment,
  deliveryCarrier,
}: {
  fulfillment?: string | null;
  deliveryCarrier?: string | null;
}): boolean {
  return (
    fulfillment === "delivery" &&
    (deliveryCarrier === SHIPPING_PROVIDER_CDEK ||
      deliveryCarrier === SHIPPING_PROVIDER_YANDEX_DELIVERY ||
      deliveryCarrier === SHIPPING_PROVIDER_YANDEX_EXPRESS)
  );
}

/**
 * Возврат («Отказаться» у покупателя, «Вернулся» у продавца) — пока покупатель
 * не подтвердил получение: товар уехал, но сделка не состоялась. Если
 * отправление ведёт служба, кнопки нет: иначе покупатель «отказался», а
 * посылка продолжала ехать в пункт, и заказ застревал в «Возвращён».
 */
export function canMarkOrderItemReturned({
  status,
  carrierTracksShipment,
}: {
  status?: string | null;
  carrierTracksShipment: boolean;
}): boolean {
  return (
    !carrierTracksShipment &&
    (status === ORDER_STATUS_SHIPPED || status === ORDER_STATUS_DELIVERED)
  );
}
