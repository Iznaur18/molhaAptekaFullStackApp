import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
} from "@molha/api-contract";

import { buildOrderStatusFromItems } from "./orderStatus.js";

/**
 * Отправление — это заказ плюс один продавец.
 *
 * Заказ №451 с товарами Ивана и Петра — это два отправления: у каждого своя
 * точка забора, свой способ получения и свой статус. Раньше способ получения
 * был один на весь заказ, из-за чего покупатель не мог одним заказом взять
 * товар самовывозом у одного продавца и доставкой у другого.
 *
 * Группировка выводится из `items.sellerIdAtOrder`, отдельно хранится только
 * способ получения: он выбирается покупателем и из позиций не выводится.
 */

/** Ключ для позиций, чей продавец неизвестен (товар удалён до бэкфила). */
export const ORPHAN_SHIPMENT_KEY = "";

/**
 * Продавец позиции.
 *
 * Основной источник — денормализованный `sellerIdAtOrder`. У заказов до
 * бэкфила его нет, поэтому падаем на populate товара: там продавец есть,
 * пока сам товар не удалён.
 *
 * @param {{ sellerIdAtOrder?: unknown; productId?: unknown }} item
 * @returns {string | null}
 */
export const resolveItemSellerId = (item) => {
  if (item?.sellerIdAtOrder) return String(item.sellerIdAtOrder);

  const product = item?.productId;
  if (!product || typeof product !== "object") return null;

  const seller = product.productSeller;
  if (!seller) return null;
  return String(seller._id ?? seller);
};

/**
 * @param {Array<Record<string, unknown>>} items
 * @returns {Map<string, { sellerId: string | null; itemIndexes: number[]; items: Array<Record<string, unknown>> }>}
 */
export const groupOrderItemsBySellerId = (items) => {
  /** @type {Map<string, { sellerId: string | null; itemIndexes: number[]; items: any[] }>} */
  const bySeller = new Map();
  if (!Array.isArray(items)) return bySeller;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item || typeof item !== "object") continue;

    const raw = resolveItemSellerId(item);
    const key = raw ?? ORPHAN_SHIPMENT_KEY;
    const bucket = bySeller.get(key) ?? {
      sellerId: key === ORPHAN_SHIPMENT_KEY ? null : key,
      itemIndexes: [],
      items: [],
    };
    bucket.itemIndexes.push(index);
    bucket.items.push(item);
    bySeller.set(key, bucket);
  }

  return bySeller;
};

/**
 * Способ получения конкретного отправления.
 *
 * Читаем сохранённый на отправлении, а для заказов до этой схемы падаем на
 * общий `order.fulfillmentMethod` — он там был один на всех.
 *
 * @param {{ shipments?: Array<{ sellerId?: unknown; fulfillmentMethod?: unknown }>; fulfillmentMethod?: unknown }} order
 * @param {string | null} sellerId
 * @returns {"pickup" | "delivery"}
 */
export const resolveShipmentFulfillment = (order, sellerId) => {
  const stored = Array.isArray(order?.shipments)
    ? order.shipments.find(
        (row) => row?.sellerId != null && String(row.sellerId) === String(sellerId),
      )
    : null;

  const candidate = stored?.fulfillmentMethod ?? order?.fulfillmentMethod;
  return candidate === ORDER_FULFILLMENT_DELIVERY
    ? ORDER_FULFILLMENT_DELIVERY
    : ORDER_FULFILLMENT_PICKUP;
};

/**
 * Разбирает заказ на отправления со статусом и способом получения.
 *
 * Статус отправления считается тем же сводом, что и статус заказа, только по
 * позициям одного продавца: продавец двигает своё отправление целиком, но
 * отменить или вернуть отдельную позицию по-прежнему можно.
 *
 * @param {{ items?: Array<Record<string, unknown>> } & Record<string, unknown>} order
 * @returns {Array<{ sellerId: string | null; fulfillmentMethod: "pickup" | "delivery"; status: string; itemIndexes: number[] }>}
 */
export const buildOrderShipments = (order) => {
  const grouped = groupOrderItemsBySellerId(order?.items);

  return [...grouped.values()].map((bucket) => ({
    sellerId: bucket.sellerId,
    fulfillmentMethod: resolveShipmentFulfillment(order, bucket.sellerId),
    status: buildOrderStatusFromItems(bucket.items),
    itemIndexes: bucket.itemIndexes,
  }));
};

/**
 * Хранимая часть отправлений — только способ получения на продавца.
 *
 * Статус и состав выводятся из позиций, дублировать их в документе нельзя:
 * разъедутся при первой же смене статуса позиции.
 *
 * @param {Array<Record<string, unknown>>} items
 * @param {Record<string, "pickup" | "delivery"> | null} fulfillmentBySellerId
 * @param {"pickup" | "delivery"} fallbackFulfillment
 */
export const buildStoredShipments = (
  items,
  fulfillmentBySellerId,
  fallbackFulfillment = ORDER_FULFILLMENT_PICKUP,
  deliveryFeeBySellerId = null,
  courierDeliveryBySellerId = null,
  payoutRequisitesBySellerId = null,
  deliveryCarrierBySellerId = null,
) => {
  const grouped = groupOrderItemsBySellerId(items);
  /** @type {Array<{ sellerId: string; fulfillmentMethod: "pickup" | "delivery" }>} */
  const shipments = [];

  for (const bucket of grouped.values()) {
    if (!bucket.sellerId) continue;
    const chosen = fulfillmentBySellerId?.[bucket.sellerId] ?? fallbackFulfillment;
    const method =
      chosen === ORDER_FULFILLMENT_DELIVERY
        ? ORDER_FULFILLMENT_DELIVERY
        : ORDER_FULFILLMENT_PICKUP;
    shipments.push({
      sellerId: bucket.sellerId,
      fulfillmentMethod: method,
      // У самовывоза платить курьеру некому.
      deliveryFeeRub:
        method === ORDER_FULFILLMENT_DELIVERY
          ? (deliveryFeeBySellerId?.[bucket.sellerId] ?? 0)
          : 0,
      // Только такие отправления попадают в «Обзор» курьера.
      courierDelivery:
        method === ORDER_FULFILLMENT_DELIVERY &&
        courierDeliveryBySellerId?.[bucket.sellerId] === true,
      sellerPayoutRequisites:
        payoutRequisitesBySellerId?.[bucket.sellerId] ?? "",
      // Кто именно везёт: продавец, курьеры Gitorg или внешняя служба.
      // У самовывоза перевозчика нет.
      deliveryCarrier:
        method === ORDER_FULFILLMENT_DELIVERY
          ? (deliveryCarrierBySellerId?.[bucket.sellerId] ?? "")
          : "",
    });
  }

  return shipments;
};
