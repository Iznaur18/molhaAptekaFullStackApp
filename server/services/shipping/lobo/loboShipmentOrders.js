import { PRODUCT_DELIVERY_CARRIER_LOBO } from "@molha/api-contract";

import {
  LOBO_CANCELLABLE_STATUSES,
  LOBO_STATUS_CANCELLED,
} from "../../../constants/loboConstants.js";
import { OrderModel, ProductModel, UserModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";
import { resolveItemSellerId } from "../../order/orderShipments.js";

import {
  cancelLoboOrderByExternalId,
  createLoboOrder,
  estimateLoboDelivery,
  isLoboConfigured,
} from "./loboClient.js";

/**
 * Наш номер заказа в ЛОБО.
 *
 * Отправление адресуется парой «заказ + продавец» — она же и есть ключ на
 * той стороне. По нему мы потом читаем статус и отменяем, не храня чужой id
 * как единственную ниточку.
 *
 * @param {unknown} orderId
 * @param {unknown} sellerId
 */
export const buildLoboExternalId = (orderId, sellerId) =>
  `${String(orderId)}:${String(sellerId)}`;

/**
 * @param {any} order
 * @param {string} sellerId
 */
const findShipment = (order, sellerId) =>
  (order.shipments ?? []).find(
    (row) => row?.sellerId != null && String(row.sellerId) === String(sellerId),
  ) ?? null;

/**
 * Точка, откуда ЛОБО заберёт заказ.
 *
 * Берём ту, что покупатель выбрал при оформлении: у продавца может быть
 * несколько точек, и приехать надо именно в выбранную.
 *
 * @param {any} order
 * @param {string} sellerId
 */
const resolvePickupPoint = async (order, sellerId) => {
  const items = (order.items ?? []).filter(
    (item) => resolveItemSellerId(item) === String(sellerId),
  );
  for (const item of items) {
    const address = String(item.pickupAddressAtOrder ?? "").trim();
    if (address) {
      return {
        address,
        lat: Number(item.pickupLatAtOrder),
        lon: Number(item.pickupLonAtOrder),
      };
    }
  }

  // Заказы до появления снимка точки: берём адрес с самого товара.
  const productId = items[0]?.productId?._id ?? items[0]?.productId;
  if (!productId) return null;
  const product = await ProductModel.findById(productId)
    .select("productPickupAddress productPickupLat productPickupLon")
    .lean();
  if (!product?.productPickupAddress) return null;
  return {
    address: String(product.productPickupAddress),
    lat: Number(product.productPickupLat),
    lon: Number(product.productPickupLon),
  };
};

/**
 * Готово ли отправление к передаче в ЛОБО.
 *
 * Проверяем всё до единого запроса наружу: неполный заказ служба примет и
 * пришлёт курьера в никуда.
 *
 * @param {{ order: any; sellerId: string }} input
 */
export async function collectLoboOrderPayload({ order, sellerId }) {
  const shipment = findShipment(order, sellerId);
  if (!shipment) return { ok: false, reason: "Отправление не найдено" };
  if (shipment.deliveryCarrier !== PRODUCT_DELIVERY_CARRIER_LOBO) {
    return { ok: false, reason: "Это отправление везёт не ЛОБО" };
  }

  const pickup = await resolvePickupPoint(order, sellerId);
  if (!pickup?.address || !Number.isFinite(pickup.lat) || !Number.isFinite(pickup.lon)) {
    return { ok: false, reason: "У точки отправления нет координат" };
  }

  const deliveryAddress = [order.deliveryAddress, order.deliveryAddressFlat]
    .filter(Boolean)
    .join(", ")
    .trim();
  const deliveryLat = Number(order.deliveryAddressGeo?.lat);
  const deliveryLon = Number(order.deliveryAddressGeo?.lon);
  if (!deliveryAddress) {
    return { ok: false, reason: "У заказа нет адреса доставки" };
  }
  if (!Number.isFinite(deliveryLat) || !Number.isFinite(deliveryLon)) {
    return { ok: false, reason: "У адреса доставки нет координат" };
  }

  const seller = await UserModel.findById(sellerId)
    .select("userName userPhoneNumber")
    .lean();
  const buyer = order.userBuyerId;

  // Служба требует телефон клиента: к продавцу поедет курьер, и звонить
  // ему будут по этому номеру. Проверяем до вызова — иначе получим 400 уже
  // после того, как продавец нажал кнопку.
  const clientPhone = String(seller?.userPhoneNumber ?? "").trim();
  if (!clientPhone) {
    return { ok: false, reason: "У продавца не указан телефон — служба без него заказ не примет" };
  }

  return {
    ok: true,
    payload: {
      externalId: buildLoboExternalId(order._id, sellerId),
      // Клиент службы — продавец: к нему едет курьер и с ним связывается.
      clientName: seller?.userName ?? "Продавец",
      clientPhone,
      pickupAddress: pickup.address,
      pickupLat: pickup.lat,
      pickupLon: pickup.lon,
      deliveryAddress,
      deliveryLat,
      deliveryLon,
      recipientName: buyer?.userName ?? "",
      recipientPhone: buyer?.userPhoneNumber ?? "",
      note: `Заказ Gitorg ${String(order._id)}`,
    },
  };
}

/**
 * Отдать отправление в ЛОБО.
 *
 * Вызывается, когда продавец собрал заказ. Не роняет ступень лестницы: если
 * служба недоступна, товар всё равно готов к отгрузке, а повторить вызов
 * можно кроном или руками. Возвращает, что случилось, — решает вызывающий.
 *
 * @param {{ orderId: string; sellerId: string }} input
 */
export async function handOverShipmentToLobo({ orderId, sellerId }) {
  if (!isLoboConfigured()) {
    return { ok: false, reason: "ЛОБО не настроена" };
  }

  const order = await OrderModel.findById(orderId).populate(
    "userBuyerId",
    "userName userPhoneNumber",
  );
  if (!order) return { ok: false, reason: "Заказ не найден" };

  const shipment = findShipment(order, sellerId);
  if (!shipment) return { ok: false, reason: "Отправление не найдено" };
  // Повторный вызов не создаёт второй заказ: у службы он уже есть.
  if (shipment.shippingExternalId) {
    return { ok: true, alreadySent: true, externalId: shipment.shippingExternalId };
  }

  const collected = await collectLoboOrderPayload({ order, sellerId });
  if (!collected.ok) {
    logServerEvent("error", {
      event: "lobo_handover_skipped",
      orderId: String(orderId),
      sellerId: String(sellerId),
      reason: collected.reason,
    });
    return { ok: false, reason: collected.reason };
  }

  let cost = Number(shipment.deliveryFeeRub) || 0;
  if (cost <= 0) {
    // Цену спрашиваем у службы: покупатель платит курьеру при получении, и
    // сумма должна быть той, которую назовёт сам курьер.
    try {
      const quote = await estimateLoboDelivery({
        pickupLat: collected.payload.pickupLat,
        pickupLon: collected.payload.pickupLon,
        deliveryLat: collected.payload.deliveryLat,
        deliveryLon: collected.payload.deliveryLon,
      });
      cost = quote.finalCost;
    } catch (error) {
      logServerEvent("error", {
        event: "lobo_estimate_failed",
        orderId: String(orderId),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  let created;
  try {
    created = await createLoboOrder({
      ...collected.payload,
      cost: cost > 0 ? cost : null,
      paymentMethod: order.paymentMethod,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "lobo_handover_failed",
      orderId: String(orderId),
      sellerId: String(sellerId),
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, reason: error instanceof Error ? error.message : "Ошибка" };
  }

  shipment.shippingProvider = PRODUCT_DELIVERY_CARRIER_LOBO;
  shipment.shippingExternalId = collected.payload.externalId;
  shipment.shippingCarrierStatus = created?.status ?? "";
  if (cost > 0 && !(Number(shipment.deliveryFeeRub) > 0)) {
    shipment.deliveryFeeRub = cost;
  }
  await order.save();

  logServerEvent("info", {
    event: "lobo_handover_created",
    orderId: String(orderId),
    sellerId: String(sellerId),
    externalId: collected.payload.externalId,
    status: created?.status ?? "",
    cost,
  });

  return { ok: true, externalId: collected.payload.externalId, status: created?.status };
}

/**
 * Отменить заказ в ЛОБО, если он там есть и его ещё можно отменить.
 *
 * @param {{ orderId: string; sellerId: string }} input
 */
export async function cancelShipmentInLobo({ orderId, sellerId }) {
  if (!isLoboConfigured()) return { ok: false, reason: "ЛОБО не настроена" };

  const order = await OrderModel.findById(orderId);
  const shipment = order ? findShipment(order, sellerId) : null;
  const externalId = shipment?.shippingExternalId;
  if (!externalId) return { ok: false, reason: "Заказ в службу не передавался" };
  if (shipment.shippingCarrierStatus === LOBO_STATUS_CANCELLED) {
    return { ok: true, alreadyCancelled: true };
  }
  if (!LOBO_CANCELLABLE_STATUSES.includes(shipment.shippingCarrierStatus)) {
    return { ok: false, reason: "Курьер уже забрал заказ — отмена через спор" };
  }

  try {
    const cancelled = await cancelLoboOrderByExternalId(externalId);
    shipment.shippingCarrierStatus = cancelled?.status ?? LOBO_STATUS_CANCELLED;
    await order.save();
    logServerEvent("info", {
      event: "lobo_order_cancelled",
      orderId: String(orderId),
      externalId,
    });
    return { ok: true };
  } catch (error) {
    logServerEvent("error", {
      event: "lobo_cancel_failed",
      orderId: String(orderId),
      externalId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, reason: error instanceof Error ? error.message : "Ошибка" };
  }
}
