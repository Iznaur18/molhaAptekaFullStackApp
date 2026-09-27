import {
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
} from "./shippingProvider.js";
import { SHIPPING_PROVIDER_YANDEX_EXPRESS } from "./yandexDelivery.js";

/**
 * Службы, у которых ступени отправления после отгрузки ставит опрос их
 * статусов: «Доставлен», а если посылка вернулась продавцу, — «Возвращён».
 *
 * Отметить возврат руками у таких отправлений нельзя: СДЭК продолжал бы
 * везти посылку, а у нас заказ уже закрыт и опрос его больше не спрашивает.
 * Так 25.09.2026 покупатель нажал «Отказаться», пока посылка ехала в пункт,
 * и заказ застрял в «Возвращён», хотя в СДЭК он был «Готов к выдаче».
 *
 * ЛОБО здесь нет: его опрос возврат не отмечает, и продавцу нужна кнопка.
 */
export const SHIPPING_CARRIERS_WITH_STATUS_SYNC = [
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
  SHIPPING_PROVIDER_YANDEX_EXPRESS,
];

export const CARRIER_MANAGED_RETURN_MESSAGE =
  "Статус этой посылки ведёт служба доставки: отказаться можно в пункте выдачи, возврат отметится сам, когда посылка вернётся к продавцу";

/**
 * @param {string | null | undefined} deliveryCarrier перевозчик отправления
 * @returns {boolean}
 */
export function isShipmentStatusManagedByCarrier(deliveryCarrier) {
  return SHIPPING_CARRIERS_WITH_STATUS_SYNC.includes(String(deliveryCarrier ?? ""));
}
