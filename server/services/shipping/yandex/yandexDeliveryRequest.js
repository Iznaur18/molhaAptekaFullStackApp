import {
  resolveProductShipping,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
} from "@molha/api-contract";

import {
  ORDER_PRE_SHIPMENT_STATUSES,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
} from "../../../constants/orderConstants.js";
import { AppError } from "../../../errors/AppError.js";
import { OrderModel, ProductModel, UserModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";
import { resolveItemSellerId } from "../../order/orderShipments.js";
import {
  applyCarrierReturnToOrder,
  applyCarrierStepToOrder,
} from "../carrierOrderSteps.js";

import {
  yandexDeliveryRequest,
  yandexDeliveryRequestFile,
} from "./yandexDeliveryClient.js";
import { parseYandexMoney } from "./yandexDeliveryPricing.js";
import { resolveSellerYandexDeliveryCredentials } from "./yandexDeliverySellerCredentials.js";

/**
 * Заявка в Яндекс Доставку по заказу: продавец жмёт кнопку в «Моих продажах»,
 * мы создаём заявку его токеном (offers/create → offers/confirm) и дальше
 * двигаем заказ по статусам Яндекса.
 *
 * Деньги: товар и доставку Яндекс берёт с покупателя картой в пункте
 * (card_on_receipt, решение 22.09.2026) и переводит продавцу; комиссию за
 * приём оплаты списывает с продавца.
 */

export const YANDEX_REQUEST_EXISTS_MESSAGE = "Заявка в Яндекс Доставку уже создана";

/** Заявка есть, но посылку ещё не сдали. */
const YANDEX_NOT_HANDED_OVER = new Set([
  "VALIDATING_ERROR",
  "CREATED",
  "DELIVERY_PROCESSING_STARTED",
  "SORTING_CENTER_LOADED",
]);

/** Посылка у Яндекса и едет (статусная модель «до ПВЗ»). */
const YANDEX_IN_TRANSIT = new Set([
  "SORTING_CENTER_AT_START",
  "SORTING_CENTER_PREPARED",
  "SORTING_CENTER_TRANSMITTED",
  "DELIVERY_AT_START",
  "DELIVERY_AT_START_SORT",
  "DELIVERY_TRANSPORTATION",
  "DELIVERY_TRANSPORTATION_RECIPIENT",
  "DELIVERY_ARRIVED_PICKUP_POINT",
  "DELIVERY_ATTEMPT_FAILED",
  "CONFIRMATION_CODE_RECEIVED",
]);

/** Покупатель забрал. Частичный выкуп лестницу не двигает — решает продавец. */
const YANDEX_DELIVERED = new Set([
  "DELIVERY_DELIVERED",
  "DELIVERY_TRANSMITTED_TO_RECIPIENT",
]);

/** Возврат доехал до продавца. */
const YANDEX_RETURNED = "RETURN_RETURNED";

/** Дальше опрашивать нечего. */
const YANDEX_FINAL = new Set([...YANDEX_DELIVERED, YANDEX_RETURNED, "CANCELLED"]);

const PRE_SHIPMENT = new Set(ORDER_PRE_SHIPMENT_STATUSES);

/**
 * @param {string | null | undefined} status
 * @returns {"shipped" | "delivered" | null}
 */
export function resolveOrderStepForYandexStatus(status) {
  const code = String(status ?? "");
  if (YANDEX_DELIVERED.has(code)) return ORDER_STATUS_DELIVERED;
  if (YANDEX_IN_TRANSIT.has(code)) return ORDER_STATUS_SHIPPED;
  return null;
}

/** @param {string | null | undefined} status */
export const isBeforeYandexHandover = (status) =>
  !status || YANDEX_NOT_HANDED_OVER.has(String(status));

/**
 * @param {Record<string, any>} order
 * @param {string} sellerId
 */
function findSellerYandexShipment(order, sellerId) {
  return (
    (order?.shipments ?? []).find(
      (row) =>
        String(row?.sellerId) === String(sellerId) &&
        row?.yandexDeliveryShipmentAtOrder,
    ) ?? null
  );
}

/**
 * @param {{ orderId: string; sellerId: string }} params
 */
async function loadSellerOrder({ orderId, sellerId }) {
  const order = await OrderModel.findById(orderId).lean();
  if (!order) throw new AppError(404, "Заказ не найден");
  const shipment = findSellerYandexShipment(order, sellerId);
  if (!shipment) {
    // И чужой заказ, и заказ без Яндекса дают одно: заявку тут не создать.
    throw new AppError(404, "В этом заказе нет вашей отправки Яндекс Доставкой");
  }
  return { order, shipment };
}

/**
 * @param {string} orderId
 * @param {string} sellerId
 * @param {Record<string, unknown>} request
 */
async function saveRequest(orderId, sellerId, request) {
  const set = { "shipments.$.yandexDeliveryRequest": request };
  if (request.requestId) {
    set["shipments.$.shippingExternalId"] = String(request.requestId);
  }
  // Ссылка отслеживания Яндекса — покупателю вместо трек-номера.
  if (request.sharingUrl) {
    set.shippingTrackingUrl = String(request.sharingUrl);
  }
  await OrderModel.updateOne(
    { _id: orderId, "shipments.sellerId": sellerId },
    { $set: set },
  );
}

/**
 * Тело offers/create. Вынесено, чтобы проверить его без Яндекса.
 *
 * @param {{
 *   order: Record<string, any>;
 *   shipment: Record<string, any>;
 *   productsById: Map<string, Record<string, any>>;
 *   sellerInn?: string;
 * }} input
 */
export function buildYandexOfferBody({
  order,
  shipment,
  productsById,
  sellerInn = "",
}) {
  const snapshot = shipment.yandexDeliveryShipmentAtOrder;
  const sellerId = String(shipment.sellerId);
  const orderNumber = `${String(order._id)}-${sellerId.slice(-6)}`;
  const barcode = `${String(order._id).slice(-8)}-1`;

  const lines = (order.items ?? []).filter(
    (item) => resolveItemSellerId(item) === sellerId && PRE_SHIPMENT.has(item.status),
  );

  let weightG = 0;
  let lengthCm = 0;
  let widthCm = 0;
  let heightCm = 0;
  const items = lines.map((item) => {
    const productId = String(item.productId?._id ?? item.productId);
    const shipping = resolveProductShipping(productsById.get(productId));
    const count = Math.max(1, Number(item.quantity) || 1);
    weightG += shipping.weightG * count;
    lengthCm = Math.max(lengthCm, shipping.lengthCm);
    widthCm = Math.max(widthCm, shipping.widthCm);
    heightCm += shipping.heightCm * count;
    const kopecks = Math.round(Math.max(0, Number(item.unitPriceAtOrder) || 0) * 100);
    return {
      count,
      name: String(item.productNameAtOrder ?? "Товар").slice(0, 255),
      article: productId,
      billing_details: {
        // Сколько Яндекс возьмёт с покупателя за штуку — и объявленная ценность.
        unit_price: kopecks,
        assessed_unit_price: kopecks,
        // Без НДС, пока у продавца не задано иное: -1 по документации Яндекса.
        nds: -1,
        ...(sellerInn ? { inn: sellerInn } : {}),
      },
      place_barcode: barcode,
    };
  });

  const [firstName, ...rest] = String(snapshot.recipient?.name ?? "")
    .trim()
    .split(/\s+/);
  return {
    info: { operator_request_id: orderNumber },
    source: { platform_station: { platform_id: snapshot.dropoffStationId } },
    destination: {
      type: "platform_station",
      platform_station: { platform_id: snapshot.pickupPoint?.id },
    },
    items,
    places: [
      {
        physical_dims: {
          weight_gross: Math.max(1, Math.round(weightG)),
          dx: Math.max(1, Math.round(lengthCm)),
          dy: Math.max(1, Math.round(widthCm)),
          dz: Math.max(1, Math.min(Math.round(heightCm), 300)),
        },
        barcode,
      },
    ],
    billing_info: {
      payment_method: "card_on_receipt",
      // Доставку покупатель платит в пункте вместе с товаром.
      delivery_cost: Math.round(
        Math.max(0, Number(snapshot.deliverySumRub) || 0) * 100,
      ),
    },
    recipient_info: {
      first_name: firstName || "Получатель",
      ...(rest.length ? { last_name: rest.join(" ") } : {}),
      phone: snapshot.recipient?.phone ?? "",
    },
    last_mile_policy: "self_pickup",
  };
}

/**
 * Самое дешёвое предложение: у одного пункта сдачи Яндекс обычно отдаёт
 * несколько вариантов отгрузки с разной ценой.
 *
 * @param {unknown} payload ответ offers/create
 */
export function pickCheapestOffer(payload) {
  const offers = Array.isArray(/** @type {any} */ (payload)?.offers)
    ? /** @type {any} */ (payload).offers
    : [];
  let best = null;
  let bestPrice = Infinity;
  for (const offer of offers) {
    if (!offer?.offer_id) continue;
    const price = parseYandexMoney(offer.offer_details?.pricing_total) ?? Infinity;
    if (best === null || price < bestPrice) {
      best = offer;
      bestPrice = price;
    }
  }
  return best;
}

/**
 * @param {{ orderId: string; sellerId: string }} params
 */
export async function createYandexDeliveryRequest({ orderId, sellerId }) {
  const { order, shipment } = await loadSellerOrder({ orderId, sellerId });
  if (shipment.yandexDeliveryRequest?.requestId) {
    throw new AppError(409, YANDEX_REQUEST_EXISTS_MESSAGE);
  }
  if (!shipment.yandexDeliveryShipmentAtOrder.recipient?.phone) {
    throw new AppError(
      409,
      "В заказе нет телефона получателя — Яндекс без него не примет",
    );
  }

  // Заказ уже принят: тумблер продавца заявке не мешает.
  const credentials = await resolveSellerYandexDeliveryCredentials(sellerId);
  const productIds = (order.items ?? [])
    .filter((item) => resolveItemSellerId(item) === String(sellerId))
    .map((item) => item.productId);
  const [products, seller] = await Promise.all([
    ProductModel.find({ _id: { $in: productIds } })
      .select("productWeightG productLengthCm productWidthCm productHeightCm")
      .lean(),
    UserModel.findById(sellerId).select("sellerSafeDeal.inn").lean(),
  ]);
  const body = buildYandexOfferBody({
    order,
    shipment,
    productsById: new Map(products.map((row) => [String(row._id), row])),
    sellerInn: String(seller?.sellerSafeDeal?.inn ?? "").trim(),
  });

  const offer = pickCheapestOffer(
    await yandexDeliveryRequest(credentials, { path: "/offers/create", body }),
  );
  if (!offer) {
    throw new AppError(
      409,
      "Яндекс не нашёл вариантов отправки из вашего пункта сдачи — проверьте пункт в «Доставка и оплата»",
    );
  }
  const confirmed = await yandexDeliveryRequest(credentials, {
    path: "/offers/confirm",
    body: { offer_id: offer.offer_id },
  });
  const requestId = /** @type {any} */ (confirmed)?.request_id;
  if (!requestId) {
    throw new AppError(502, "Яндекс не подтвердил заявку — попробуйте ещё раз");
  }

  const request = {
    requestId: String(requestId),
    offerId: String(offer.offer_id),
    pricingTotal: offer.offer_details?.pricing_total ?? null,
    createdAt: new Date(),
    status: "CREATED",
    statusDescription: null,
    sharingUrl: null,
    error: null,
  };
  await saveRequest(orderId, sellerId, request);
  logServerEvent("yandex_delivery.request_created", {
    orderId: String(orderId),
    requestId: request.requestId,
  });
  return refreshYandexDeliveryRequest({ orderId, sellerId });
}

/**
 * Спросить у Яндекса состояние заявки и сдвинуть заказ по нему.
 *
 * @param {{ orderId: string; sellerId: string }} params
 */
export async function refreshYandexDeliveryRequest({ orderId, sellerId }) {
  const { shipment } = await loadSellerOrder({ orderId, sellerId });
  const current = shipment.yandexDeliveryRequest;
  if (!current?.requestId) throw new AppError(404, "Заявка ещё не создана");

  const credentials = await resolveSellerYandexDeliveryCredentials(sellerId);
  const info = /** @type {Record<string, any>} */ (
    await yandexDeliveryRequest(credentials, {
      method: "GET",
      path: "/request/info",
      query: { request_id: current.requestId },
    })
  );
  const request = {
    ...current,
    status: info?.state?.status ? String(info.state.status) : (current.status ?? null),
    statusDescription: info?.state?.description
      ? String(info.state.description)
      : (current.statusDescription ?? null),
    cancelReason: info?.state?.reason ? String(info.state.reason) : null,
    sharingUrl: info?.sharing_url
      ? String(info.sharing_url)
      : (current.sharingUrl ?? null),
    syncedAt: new Date(),
  };
  await saveRequest(orderId, sellerId, request);

  await applyCarrierStepToOrder({
    orderId,
    sellerId,
    step: resolveOrderStepForYandexStatus(request.status),
    carrier: SHIPPING_PROVIDER_YANDEX_DELIVERY,
    statusCode: request.status,
  });
  if (request.status === YANDEX_RETURNED) {
    await applyCarrierReturnToOrder({
      orderId,
      sellerId,
      carrier: SHIPPING_PROVIDER_YANDEX_DELIVERY,
    });
  }
  return request;
}

/**
 * Снять заявку, когда заказ у нас отменили. Ошибку не бросаем — отмену у нас
 * она не блокирует, продавцу остаётся пометка.
 *
 * @param {{ orderId: string; sellerId: string }} input
 */
export async function cancelYandexDeliveryRequest({ orderId, sellerId }) {
  const order = await OrderModel.findById(orderId).select("shipments").lean();
  const shipment = order ? findSellerYandexShipment(order, sellerId) : null;
  const current = shipment?.yandexDeliveryRequest;
  if (!current?.requestId || current.cancelledAt) return { ok: true, skipped: true };

  try {
    const credentials = await resolveSellerYandexDeliveryCredentials(sellerId);
    const result = /** @type {Record<string, any>} */ (
      await yandexDeliveryRequest(credentials, {
        path: "/request/cancel",
        body: { request_id: current.requestId },
      })
    );
    if (result?.status === "ERROR") {
      throw new Error(result?.description || "Яндекс не отменил заявку");
    }
    await saveRequest(orderId, sellerId, {
      ...current,
      cancelledAt: new Date(),
      cancelError: null,
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await saveRequest(orderId, sellerId, {
      ...current,
      cancelError: message.slice(0, 300),
    });
    logServerEvent("yandex_delivery.request_cancel_failed", {
      orderId: String(orderId),
      error: message,
    });
    return { ok: false, reason: message };
  }
}

/**
 * Ярлык на коробку (PDF 100×150 — формат термопринтеров и половины А5).
 *
 * @param {{ orderId: string; sellerId: string }} params
 */
export async function getYandexDeliveryLabelPdf({ orderId, sellerId }) {
  const { shipment } = await loadSellerOrder({ orderId, sellerId });
  const current = shipment.yandexDeliveryRequest;
  if (!current?.requestId)
    throw new AppError(409, "Сначала создайте заявку в Яндекс Доставку");
  if (current.cancelledAt) throw new AppError(409, "Заявка отменена — ярлык не нужен");
  const credentials = await resolveSellerYandexDeliveryCredentials(sellerId);
  const pdf = await yandexDeliveryRequestFile(credentials, {
    path: "/request/generate-labels",
    body: {
      request_ids: [current.requestId],
      generate_type: "one",
      label_size_mm: "100x150",
      language: "ru",
    },
  });
  return { pdf, fileName: `yandex-${String(orderId).slice(-8)}.pdf` };
}

const SYNC_BATCH_LIMIT = 30;

/**
 * Один проход опроса заявок Яндекса — вебхуков у Яндекса «в другой день» нет.
 */
export async function syncYandexDeliveryRequests({ limit = SYNC_BATCH_LIMIT } = {}) {
  const finals = [...YANDEX_FINAL];
  const orders = await OrderModel.find({
    shipments: {
      $elemMatch: {
        "yandexDeliveryRequest.requestId": { $exists: true, $nin: ["", null] },
        "yandexDeliveryRequest.status": { $nin: finals },
        "yandexDeliveryRequest.cancelledAt": { $in: [null] },
      },
    },
    "items.status": {
      $in: [...PRE_SHIPMENT, ORDER_STATUS_SHIPPED, ORDER_STATUS_DELIVERED],
    },
  })
    .select("shipments")
    .sort({ updatedAt: 1 })
    .limit(limit)
    .lean();

  let checked = 0;
  let failed = 0;
  for (const order of orders) {
    for (const shipment of order.shipments ?? []) {
      const request = shipment?.yandexDeliveryRequest;
      if (
        !request?.requestId ||
        request.cancelledAt ||
        finals.includes(request.status)
      ) {
        continue;
      }
      checked += 1;
      try {
        await refreshYandexDeliveryRequest({
          orderId: String(order._id),
          sellerId: String(shipment.sellerId),
        });
      } catch (error) {
        failed += 1;
        logServerEvent("yandex_delivery.request_sync_failed", {
          orderId: String(order._id),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  return { checked, failed };
}
