import { MY_ORDER_UNKNOWN_SELLER_ID } from "@izibuy/shared-lib";

import {
  ORDER_PRE_SHIPMENT_STATUSES,
  ORDER_STATUS_CANCELLED,
} from "../model/constants.js";

const PRE_SHIPMENT_STATUSES = new Set(ORDER_PRE_SHIPMENT_STATUSES);

/**
 * Можно ли снять заказ целиком одной кнопкой.
 *
 * Зеркалит серверное правило (`cancelOrderItems.js`): отменяем, только пока
 * все живые позиции у продавца. Уехавшая позиция оформляется возвратом, и
 * мёртвая кнопка «Отменить заказ» рядом с ней путала бы обе стороны.
 *
 * Отправление адресуется id продавца, поэтому позиции без продавца
 * (legacy-заказы) кнопку не получают: сервер такой заказ не найдёт.
 *
 * @param {{
 *   sellerId?: string | null;
 *   items?: Array<{ status?: string }> | null;
 * }} input
 */
export const canCancelOrderShipment = ({ sellerId, items }) => {
  if (!sellerId || sellerId === MY_ORDER_UNKNOWN_SELLER_ID) return false;

  const alive = (items ?? []).filter((item) => item?.status !== ORDER_STATUS_CANCELLED);

  return (
    alive.length > 0 && alive.every((item) => PRE_SHIPMENT_STATUSES.has(item?.status))
  );
};
