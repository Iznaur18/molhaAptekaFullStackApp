import {
  CDEK_DELIVERY_MODE_POINT_TO_POINT,
  CDEK_ORDER_TYPE_SHOP,
  CDEK_SHIPMENT_POINT_REQUIRED_MESSAGE,
  CDEK_WAYBILL_EXISTS_MESSAGE,
  resolveProductShipping,
} from "@molha/api-contract";

import {
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PRE_SHIPMENT_STATUSES,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
} from "../../../constants/orderConstants.js";
import { AppError } from "../../../errors/AppError.js";
import { OrderModel, ProductModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

import { resolveItemSellerId } from "../../order/orderShipments.js";

import { cdekRequest } from "./cdekClient.js";
import { resolveSellerCdekCredentials } from "./cdekSellerCredentials.js";

/**
 * Накладная СДЭК по заказу: продавец жмёт кнопку в «Моих продажах», мы
 * регистрируем заказ в СДЭК его ключом и забираем трек-номер.
 *
 * Деньги:
 * - доставку покупатель платит СДЭК в пункте (delivery_recipient_cost) —
 *   решение 21.09.2026, в totalAmount она не входит;
 * - товар: предоплаченный заказ СДЭК не берёт с покупателя (payment 0), иначе
 *   СДЭК принимает оплату товара в пункте и переводит её продавцу.
 */

const PRE_SHIPMENT = new Set(ORDER_PRE_SHIPMENT_STATUSES);

/** Посылку забрал получатель — дальше опрашивать нечего. */
const CDEK_DELIVERED_STATUS_CODES = new Set(["DELIVERED", "POSTOMAT_RECEIVED"]);

/** Накладная есть, но посылка ещё у продавца. */
const CDEK_NOT_HANDED_OVER_STATUS_CODES = new Set(["ACCEPTED", "CREATED", "INVALID"]);

/**
 * Статусы, которые лестницу не двигают: отмена накладной, невручение и
 * возврат. «Вернулся» ставит вручение возвратного заказа продавцу
 * (applyCdekReturnToOrder), а не эти статусы.
 */
const CDEK_NO_LADDER_STATUS_CODES = new Set([
  "REMOVED",
  "CANCELED",
  "CANCELLED",
  "NOT_DELIVERED",
  "RETURNED_TO_SENDER_CITY_WAREHOUSE",
  "RETURNED_TO_RECIPIENT_CITY_WAREHOUSE",
  "RETURNED_TO_TRANSIT_WAREHOUSE",
  "RETURNED",
]);

/**
 * @param {Record<string, any>} order
 * @param {string} sellerId
 */
function findSellerCdekShipment(order, sellerId) {
  const shipments = Array.isArray(order?.shipments) ? order.shipments : [];
  return (
    shipments.find(
      (row) => String(row?.sellerId) === String(sellerId) && row?.cdekShipmentAtOrder,
    ) ?? null
  );
}

/**
 * Тело `POST /v2/orders`. Вынесено отдельно, чтобы проверить его без СДЭК.
 *
 * @param {{
 *   order: Record<string, any>;
 *   shipment: Record<string, any>;
 *   productsById: Map<string, Record<string, any>>;
 *   fromAddress: string;
 *   shipmentPointCode?: string | null;
 * }} input
 */
export function buildCdekOrderBody({
  order,
  shipment,
  productsById,
  fromAddress,
  shipmentPointCode = null,
}) {
  const snapshot = shipment.cdekShipmentAtOrder;
  const sellerId = String(shipment.sellerId);
  const prepaid = order.paymentMethod === ORDER_PAYMENT_METHOD_CARD_PREPAID;

  const lines = (Array.isArray(order.items) ? order.items : []).filter(
    (item) => String(item.sellerIdAtOrder ?? "") === sellerId,
  );

  let weightG = 0;
  let lengthCm = 0;
  let widthCm = 0;
  let heightCm = 0;
  const items = lines.map((item) => {
    const productId = String(item.productId?._id ?? item.productId);
    const shipping = resolveProductShipping(productsById.get(productId));
    const quantity = Math.max(1, Number(item.quantity) || 1);
    weightG += shipping.weightG * quantity;
    lengthCm = Math.max(lengthCm, shipping.lengthCm);
    widthCm = Math.max(widthCm, shipping.widthCm);
    heightCm += shipping.heightCm * quantity;
    const unitPrice = Math.max(0, Number(item.unitPriceAtOrder) || 0);
    return {
      name: String(item.productNameAtOrder ?? "Товар").slice(0, 255),
      ware_key: productId,
      // Сколько СДЭК возьмёт с покупателя за единицу товара.
      payment: { value: prepaid ? 0 : unitPrice },
      // Объявленная стоимость — для страховки.
      cost: unitPrice,
      weight: shipping.weightG,
      amount: quantity,
    };
  });

  const pointToPoint = snapshot.deliveryMode === CDEK_DELIVERY_MODE_POINT_TO_POINT;

  return {
    type: CDEK_ORDER_TYPE_SHOP,
    // Номер у нас: по нему продавец найдёт заказ в кабинете СДЭК.
    number: `${String(order._id)}-${sellerId.slice(-6)}`,
    tariff_code: snapshot.tariffCode,
    ...(pointToPoint
      ? { shipment_point: shipmentPointCode }
      : { from_location: { address: fromAddress } }),
    delivery_point: snapshot.pickupPoint?.code,
    delivery_recipient_cost: {
      value: Math.max(0, Number(snapshot.deliverySumRub) || 0),
    },
    recipient: {
      name: snapshot.recipient?.name ?? "",
      phones: [{ number: snapshot.recipient?.phone ?? "" }],
    },
    packages: [
      {
        number: "1",
        weight: Math.max(1, weightG),
        length: Math.max(1, lengthCm),
        width: Math.max(1, widthCm),
        height: Math.max(1, Math.min(heightCm, 300)),
        items,
      },
    ],
  };
}

/**
 * Последний статус: сортировку массива СДЭК не обещает, берём по времени.
 *
 * @param {Array<Record<string, any>>} statuses
 */
function pickLatestCdekStatus(statuses) {
  let latest = null;
  let latestAt = -Infinity;
  for (const row of statuses) {
    const at = Date.parse(String(row?.date_time ?? ""));
    const time = Number.isFinite(at) ? at : -Infinity;
    if (latest === null || time > latestAt) {
      latest = row;
      latestAt = time;
    }
  }
  return latest;
}

/**
 * @param {unknown} payload ответ `GET /v2/orders/{uuid}`
 */
export function readCdekOrderState(payload) {
  const entity = /** @type {Record<string, any>} */ (payload)?.entity ?? {};
  const requests = Array.isArray(/** @type {any} */ (payload)?.requests)
    ? /** @type {any} */ (payload).requests
    : [];
  const invalid = requests.find((request) => request?.state === "INVALID");
  const errors = Array.isArray(invalid?.errors) ? invalid.errors : [];
  const statuses = Array.isArray(entity.statuses) ? entity.statuses : [];
  const latest = pickLatestCdekStatus(statuses);
  // Не вручённую посылку СДЭК везёт обратно отдельным «возвратным» заказом.
  const related = Array.isArray(entity.related_entities) ? entity.related_entities : [];
  const returnOrder = related.find((row) => row?.type === "return_order" && row?.uuid);
  return {
    cdekNumber: entity.cdek_number ? String(entity.cdek_number) : null,
    status: latest?.name ? String(latest.name) : null,
    statusCode: latest?.code ? String(latest.code) : null,
    returnUuid: returnOrder ? String(returnOrder.uuid) : null,
    error: errors.length
      ? errors
          .map((error) => error?.message ?? error?.code ?? "")
          .join("; ")
          .slice(0, 500)
      : null,
  };
}

/**
 * Записать состояние накладной в заказ. Трек-номер поднимаем и на заказ:
 * по нему уже строится ссылка отслеживания у покупателя.
 *
 * @param {string} orderId
 * @param {string} sellerId
 * @param {Record<string, unknown>} waybill
 */
async function saveWaybill(orderId, sellerId, waybill) {
  const set = { "shipments.$.cdekWaybill": waybill };
  if (waybill.cdekNumber) {
    set.shippingTrackingNumber = waybill.cdekNumber;
    set["shipments.$.shippingExternalId"] = String(waybill.uuid ?? "");
  }
  await OrderModel.updateOne(
    { _id: orderId, "shipments.sellerId": sellerId },
    { $set: set },
  );
}

/**
 * @param {{ orderId: string; sellerId: string }} params
 */
async function loadSellerOrder({ orderId, sellerId }) {
  const order = await OrderModel.findById(orderId).lean();
  if (!order) {
    throw new AppError(404, "Заказ не найден");
  }
  const shipment = findSellerCdekShipment(order, sellerId);
  if (!shipment) {
    // И чужой заказ, и заказ без СДЭК дают одно: накладную тут не создать.
    throw new AppError(404, "В этом заказе нет вашей отправки СДЭК");
  }
  return { order, shipment };
}

/**
 * @param {{ orderId: string; sellerId: string; shipmentPointCode?: string | null }} params
 */
export async function createCdekWaybill({
  orderId,
  sellerId,
  shipmentPointCode = null,
}) {
  const { order, shipment } = await loadSellerOrder({ orderId, sellerId });
  if (shipment.cdekWaybill?.uuid) {
    throw new AppError(409, CDEK_WAYBILL_EXISTS_MESSAGE);
  }
  const pointToPoint =
    shipment.cdekShipmentAtOrder.deliveryMode === CDEK_DELIVERY_MODE_POINT_TO_POINT;
  if (pointToPoint && !shipmentPointCode) {
    throw new AppError(400, CDEK_SHIPMENT_POINT_REQUIRED_MESSAGE);
  }
  if (!shipment.cdekShipmentAtOrder.recipient?.phone) {
    throw new AppError(
      409,
      "В заказе нет телефона получателя — СДЭК без него отправление не примет",
    );
  }

  // Заказ уже принят: тумблер продавца накладной не мешает.
  const credentials = await resolveSellerCdekCredentials(sellerId);

  const productIds = (order.items ?? [])
    .filter((item) => String(item.sellerIdAtOrder ?? "") === String(sellerId))
    .map((item) => item.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } })
    .select(
      "productPickupAddress productWeightG productLengthCm productWidthCm productHeightCm",
    )
    .lean();
  const productsById = new Map(products.map((row) => [String(row._id), row]));
  const fromAddress = String(products[0]?.productPickupAddress ?? "").trim();

  const body = buildCdekOrderBody({
    order,
    shipment,
    productsById,
    fromAddress,
    shipmentPointCode,
  });
  const created = await cdekRequest(credentials, {
    method: "POST",
    path: "/orders",
    body,
  });
  const uuid = /** @type {any} */ (created)?.entity?.uuid;
  if (!uuid) {
    logServerEvent("cdek.waybill_no_uuid", { orderId: String(orderId) });
    throw new AppError(502, "СДЭК не вернул номер отправления — попробуйте ещё раз");
  }

  const waybill = {
    uuid: String(uuid),
    createdAt: new Date(),
    shipmentPointCode: pointToPoint ? shipmentPointCode : null,
    cdekNumber: null,
    status: "ACCEPTED",
    error: null,
  };
  await saveWaybill(orderId, sellerId, waybill);
  logServerEvent("cdek.waybill_created", {
    orderId: String(orderId),
    uuid: waybill.uuid,
  });

  // Номер СДЭК присваивает не сразу; первая попытка — сразу же, дальше по кнопке.
  return refreshCdekWaybill({ orderId, sellerId });
}

/**
 * Спросить у СДЭК состояние накладной и сохранить трек-номер, если он готов.
 *
 * @param {{ orderId: string; sellerId: string }} params
 */
export async function refreshCdekWaybill({ orderId, sellerId }) {
  const { shipment } = await loadSellerOrder({ orderId, sellerId });
  const current = shipment.cdekWaybill;
  if (!current?.uuid) {
    throw new AppError(404, "Накладная ещё не создана");
  }

  const credentials = await resolveSellerCdekCredentials(sellerId);
  const payload = await cdekRequest(credentials, { path: `/orders/${current.uuid}` });
  const state = readCdekOrderState(payload);

  const waybill = {
    ...current,
    cdekNumber: state.cdekNumber ?? current.cdekNumber ?? null,
    status: state.status ?? current.status ?? null,
    statusCode: state.statusCode ?? current.statusCode ?? null,
    returnUuid: state.returnUuid ?? current.returnUuid ?? null,
    error: state.error,
    syncedAt: new Date(),
  };

  if (waybill.returnUuid) {
    const returnPayload = await cdekRequest(credentials, {
      path: `/orders/${waybill.returnUuid}`,
    });
    const returnState = readCdekOrderState(returnPayload);
    waybill.returnStatus = returnState.status ?? current.returnStatus ?? null;
    waybill.returnStatusCode =
      returnState.statusCode ?? current.returnStatusCode ?? null;
  }

  await saveWaybill(orderId, sellerId, waybill);
  await applyCdekStatusToOrder({ orderId, sellerId, statusCode: waybill.statusCode });
  if (CDEK_DELIVERED_STATUS_CODES.has(String(waybill.returnStatusCode ?? ""))) {
    await applyCdekReturnToOrder({ orderId, sellerId });
  }
  return waybill;
}

/**
 * Возвратный заказ СДЭК вручён продавцу — товар снова у него. Отмечаем
 * «Вернулся» штатным сервисом: он вернёт остаток и снимет выплату продавцу.
 *
 * @param {{ orderId: string; sellerId: string }} input
 * @returns {Promise<number>}
 */
export async function applyCdekReturnToOrder({ orderId, sellerId }) {
  const { markOrderItemReturned } =
    await import("../../order/updateOrderItemStatus.js");
  const order = await OrderModel.findById(orderId).select("items").lean();
  const returnable = new Set([ORDER_STATUS_SHIPPED, ORDER_STATUS_DELIVERED]);
  let moved = 0;
  for (const [index, item] of (order?.items ?? []).entries()) {
    if (resolveItemSellerId(item) !== String(sellerId)) continue;
    if (!returnable.has(item.status)) continue;
    await markOrderItemReturned({ orderId, itemIndex: index, requestUserId: sellerId });
    moved += 1;
  }
  if (moved > 0) {
    logServerEvent("cdek.order_returned", { orderId: String(orderId), moved });
  }
  return moved;
}

/**
 * Снять накладную в СДЭК, когда заказ у нас отменили. СДЭК удаляет заказ,
 * только пока посылку не сдали; иначе оставляем пометку продавцу.
 *
 * Отмену заказа у нас это не блокирует — ошибка только записывается.
 *
 * @param {{ orderId: string; sellerId: string }} input
 */
export async function cancelCdekWaybill({ orderId, sellerId }) {
  const order = await OrderModel.findById(orderId).select("shipments").lean();
  const shipment = order ? findSellerCdekShipment(order, sellerId) : null;
  const current = shipment?.cdekWaybill;
  if (!current?.uuid || current.cancelledAt) {
    return { ok: true, skipped: true };
  }

  try {
    const credentials = await resolveSellerCdekCredentials(sellerId);
    await cdekRequest(credentials, {
      method: "DELETE",
      path: `/orders/${current.uuid}`,
    });
    await saveWaybill(orderId, sellerId, {
      ...current,
      cancelledAt: new Date(),
      cancelError: null,
    });
    logServerEvent("cdek.waybill_cancelled", { orderId: String(orderId) });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await saveWaybill(orderId, sellerId, {
      ...current,
      cancelError: message.slice(0, 300),
    });
    logServerEvent("cdek.waybill_cancel_failed", {
      orderId: String(orderId),
      error: message,
    });
    return { ok: false, reason: message };
  }
}

/**
 * Что статус СДЭК значит для нашей лестницы заказа.
 *
 * Пока накладная только создана, посылка у продавца. Любой следующий статус
 * значит, что СДЭК её принял и везёт; «Вручен» — что покупатель её забрал.
 * «Не вручен» и возвраты лестницу не двигают: вернувшийся товар продавец
 * отмечает сам кнопкой «Вернулся».
 *
 * @param {string | null | undefined} statusCode
 * @returns {"shipped" | "delivered" | null}
 */
export function resolveOrderStepForCdekStatus(statusCode) {
  const code = String(statusCode ?? "");
  if (!code) return null;
  if (CDEK_DELIVERED_STATUS_CODES.has(code)) return ORDER_STATUS_DELIVERED;
  if (CDEK_NOT_HANDED_OVER_STATUS_CODES.has(code)) return null;
  if (CDEK_NO_LADDER_STATUS_CODES.has(code)) return null;
  return ORDER_STATUS_SHIPPED;
}

/**
 * Двигает позиции продавца по статусу СДЭК штатными сервисами — с их
 * уведомлениями, счётчиками продаж и эскроу. Руками продавец эти ступени
 * у СДЭК-отправлений не ставит.
 *
 * @param {{ orderId: string; sellerId: string; statusCode: string | null }} input
 * @returns {Promise<number>} сколько позиций сдвинули
 */
export async function applyCdekStatusToOrder({ orderId, sellerId, statusCode }) {
  const step = resolveOrderStepForCdekStatus(statusCode);
  if (!step) return 0;

  const { markOrderItemDeliveredBySeller, markOrderItemShippedBySeller } =
    await import("../../order/updateOrderItemStatus.js");

  const readSellerItems = async () => {
    const order = await OrderModel.findById(orderId).select("items").lean();
    // Номер позиции — место в массиве: в сыром документе itemIndex нет.
    return (order?.items ?? [])
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => resolveItemSellerId(item) === String(sellerId));
  };

  let moved = 0;
  // Опрос редкий: СДЭК мог и принять, и вручить между двумя проходами —
  // тогда сначала догоняем «Отгружен», иначе «Доставлен» не поставить.
  for (const { item, index } of await readSellerItems()) {
    if (!PRE_SHIPMENT.has(item.status)) continue;
    await markOrderItemShippedBySeller({
      orderId,
      itemIndex: index,
      sellerId,
      viaCarrierSync: true,
    });
    moved += 1;
  }

  if (step === ORDER_STATUS_DELIVERED) {
    for (const { item, index } of await readSellerItems()) {
      if (item.status !== ORDER_STATUS_SHIPPED) continue;
      await markOrderItemDeliveredBySeller({
        orderId,
        itemIndex: index,
        sellerId,
        userId: sellerId,
        viaCarrierSync: true,
      });
      moved += 1;
    }
  }

  if (moved > 0) {
    logServerEvent("cdek.order_status_applied", {
      orderId: String(orderId),
      statusCode: String(statusCode),
      step,
      moved,
    });
  }
  return moved;
}

/** Сколько накладных опрашиваем за проход. */
const CDEK_SYNC_BATCH_LIMIT = 30;

/**
 * Один проход опроса: вебхуки СДЭК требуют публичного адреса под каждого
 * продавца, поэтому спрашиваем сами. Ошибка по одной накладной (например,
 * продавец отозвал ключи) не останавливает остальные.
 */
export async function syncCdekWaybillStatuses({ limit = CDEK_SYNC_BATCH_LIMIT } = {}) {
  const finalCodes = [...CDEK_DELIVERED_STATUS_CODES];
  const orders = await OrderModel.find({
    shipments: {
      $elemMatch: {
        "cdekWaybill.uuid": { $exists: true, $nin: ["", null] },
        "cdekWaybill.statusCode": { $nin: finalCodes },
        // Отменённую накладную СДЭК уже не повезёт — спрашивать нечего.
        "cdekWaybill.cancelledAt": { $in: [null] },
      },
    },
    "items.status": { $in: [...PRE_SHIPMENT, ORDER_STATUS_SHIPPED] },
  })
    .select("shipments")
    .sort({ updatedAt: 1 })
    .limit(limit)
    .lean();

  let checked = 0;
  let failed = 0;
  for (const order of orders) {
    for (const shipment of order.shipments ?? []) {
      if (!shipment?.cdekWaybill?.uuid) continue;
      if (finalCodes.includes(shipment.cdekWaybill.statusCode)) continue;
      if (shipment.cdekWaybill.cancelledAt) continue;
      checked += 1;
      try {
        await refreshCdekWaybill({
          orderId: String(order._id),
          sellerId: String(shipment.sellerId),
        });
      } catch (error) {
        failed += 1;
        logServerEvent("cdek.waybill_sync_failed", {
          orderId: String(order._id),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  return { checked, failed };
}
