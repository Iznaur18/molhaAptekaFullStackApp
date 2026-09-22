import { randomUUID } from "node:crypto";

import {
  buildShipmentPackage,
  resolveProductShipping,
  SHIPPING_PROVIDER_YANDEX_EXPRESS,
  YANDEX_DELIVERY_DISABLED_MESSAGE,
  YANDEX_DELIVERY_NOT_CONNECTED_MESSAGE,
  YANDEX_EXPRESS_GEO_REQUIRED_MESSAGE,
  YANDEX_EXPRESS_NOT_READY_MESSAGE,
  YANDEX_EXPRESS_UNAVAILABLE_MESSAGE,
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

import { yandexDeliveryRequest } from "./yandexDeliveryClient.js";
import { resolveSellerYandexDeliveryCredentials } from "./yandexDeliverySellerCredentials.js";

/**
 * Яндекс «Экспресс»: курьер забирает у продавца и везёт покупателю по городу.
 *
 * Деньги (решение 22.09.2026): покупатель платит курьеру картой за товар и
 * доставку — доставку передаём отдельной строкой «Доставка», потому что поля
 * «стоимость доставки с получателя» у «Экспресса» нет. Сам вызов Яндекс
 * списывает с продавца; если к вызову цена выросла, разницу несёт продавец.
 * Курьера вызывает продавец кнопкой, когда соберёт заказ.
 */

const PRE_SHIPMENT = new Set(ORDER_PRE_SHIPMENT_STATUSES);
const EXPRESS_TAXI_CLASS = "express";

/** Товар у курьера и едет. */
const EXPRESS_IN_TRANSIT = new Set([
  "pickuped",
  "delivery_arrived",
  "ready_for_delivery_confirmation",
  "pay_waiting",
]);
const EXPRESS_DELIVERED = new Set(["delivered", "delivered_finish"]);
const EXPRESS_RETURNED = new Set(["returned", "returned_finish"]);
/** Курьера не будет — продавец может вызвать заново. */
const EXPRESS_RETRYABLE = new Set([
  "failed",
  "estimating_failed",
  "performer_not_found",
  "cancelled_by_taxi",
]);
/** Дальше опрашивать нечего. */
const EXPRESS_FINAL = new Set([
  "delivered_finish",
  "returned_finish",
  "cancelled",
  "cancelled_with_payment",
  "cancelled_with_items_on_hands",
  ...EXPRESS_RETRYABLE,
]);

/**
 * @param {string | null | undefined} status
 * @returns {"shipped" | "delivered" | null}
 */
export function resolveOrderStepForExpressStatus(status) {
  const code = String(status ?? "");
  if (EXPRESS_DELIVERED.has(code)) return ORDER_STATUS_DELIVERED;
  if (EXPRESS_IN_TRANSIT.has(code)) return ORDER_STATUS_SHIPPED;
  return null;
}

/**
 * Точка продажи по умолчанию — оттуда курьер забирает заказ.
 *
 * @param {Record<string, any> | null | undefined} user
 */
function pickExpressPickup(user) {
  const locations = Array.isArray(user?.sellerFulfillmentDefaults?.pickupLocations)
    ? user.sellerFulfillmentDefaults.pickupLocations
    : [];
  const location = locations.find((row) => row?.isDefault) ?? locations[0] ?? null;
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lon)) {
    return null;
  }
  return {
    address: String(location.address ?? ""),
    lat: location.lat,
    lon: location.lon,
  };
}

/**
 * Что показываем продавцу про «Экспресс».
 *
 * @param {Record<string, any> | null | undefined} user
 */
export function readYandexExpressState(user) {
  const raw = user?.yandexDeliveryIntegration ?? {};
  const pickup = pickExpressPickup(user);
  const phone = String(raw.express?.phone ?? "").trim();
  const enabled = raw.express?.enabled === true;
  const connected = Boolean(raw.tokenSealed);
  return {
    enabled,
    phone,
    pickupAddress: pickup?.address ?? "",
    ready:
      connected &&
      raw.enabled !== false &&
      enabled &&
      Boolean(phone) &&
      Boolean(pickup),
  };
}

const EXPRESS_USER_FIELDS =
  "userName yandexDeliveryIntegration sellerFulfillmentDefaults.pickupLocations";

/**
 * @param {{ sellerId: string; enabled: boolean; phone?: string }} params
 */
export async function setSellerYandexExpress({ sellerId, enabled, phone }) {
  const user = await UserModel.findById(sellerId).select(EXPRESS_USER_FIELDS).lean();
  if (!user) throw new AppError(404, "Пользователь не найден");
  const nextPhone = phone ?? user.yandexDeliveryIntegration?.express?.phone ?? "";
  if (enabled) {
    if (!user.yandexDeliveryIntegration?.tokenSealed) {
      throw new AppError(409, "Сначала вставьте токен Яндекс Доставки");
    }
    if (!nextPhone) {
      throw new AppError(
        409,
        "Укажите телефон, по которому курьер Яндекса вам позвонит",
      );
    }
    if (!pickExpressPickup(user)) {
      throw new AppError(
        409,
        "Добавьте точку продажи с адресом на карте — оттуда курьер заберёт заказ",
      );
    }
  }
  const updated = await UserModel.findByIdAndUpdate(
    sellerId,
    {
      $set: {
        "yandexDeliveryIntegration.express.enabled": enabled === true,
        "yandexDeliveryIntegration.express.phone": nextPhone,
      },
    },
    { new: true, projection: EXPRESS_USER_FIELDS },
  ).lean();
  logServerEvent("yandex_express.settings_saved", {
    sellerId: String(sellerId),
    enabled: enabled === true,
  });
  return readYandexExpressState(updated);
}

/**
 * Настройки «Экспресса» продавца для запроса к Яндексу.
 *
 * @param {string} sellerId
 * @param {{ forBuyer?: boolean }} [options] forBuyer — нужны тумблеры «включено»
 */
async function resolveExpressSetup(sellerId, { forBuyer = false } = {}) {
  const credentials = await resolveSellerYandexDeliveryCredentials(sellerId, {
    requireEnabled: forBuyer,
  });
  const user = await UserModel.findById(sellerId).select(EXPRESS_USER_FIELDS).lean();
  const state = readYandexExpressState(user);
  const pickup = pickExpressPickup(user);
  if ((forBuyer && !state.ready) || !pickup || !state.phone) {
    throw new AppError(409, YANDEX_EXPRESS_NOT_READY_MESSAGE);
  }
  return {
    credentials,
    pickup: { ...pickup, phone: state.phone },
    sellerName: String(user?.userName ?? "").trim() || "Продавец",
  };
}

/**
 * Посылка для «Экспресса» — метры и килограммы, как в API Яндекса.
 *
 * @param {Array<{ product: Record<string, unknown>; quantity: number }>} lines
 */
function buildExpressParcel(lines) {
  const units = lines.flatMap(({ product, quantity }) =>
    Array.from({ length: Math.max(1, Number(quantity) || 1) }, () => product),
  );
  const pack = buildShipmentPackage(units);
  return {
    quantity: 1,
    size: {
      length: Math.max(0.01, pack.lengthCm / 100),
      width: Math.max(0.01, pack.widthCm / 100),
      height: Math.max(0.01, pack.heightCm / 100),
    },
    weight: Math.max(0.01, pack.weightG / 1000),
  };
}

/**
 * @param {Array<{ productId: string; quantity: number }>} items
 */
async function loadLines(items) {
  const products = await ProductModel.find({
    _id: { $in: items.map((row) => row.productId) },
  })
    .select(
      "productSeller productWeightG productLengthCm productWidthCm productHeightCm",
    )
    .lean();
  if (products.length === 0) throw new AppError(404, "Товары не найдены");
  const sellerIds = new Set(products.map((row) => String(row.productSeller)));
  if (sellerIds.size > 1) {
    throw new AppError(
      400,
      "«Экспресс» везёт заказ одного продавца: оформите их отдельно",
    );
  }
  const byId = new Map(products.map((row) => [String(row._id), row]));
  return {
    sellerId: [...sellerIds][0],
    lines: items
      .filter((row) => byId.has(String(row.productId)))
      .map((row) => ({
        product: byId.get(String(row.productId)),
        quantity: row.quantity,
      })),
  };
}

/**
 * Цена «Экспресса» от продавца до точки покупателя.
 *
 * @param {{ token: string; environment?: string }} credentials
 * @param {{ from: { lat: number; lon: number }; to: { lat: number; lon: number }; parcel: Record<string, unknown> }} params
 */
async function checkExpressPrice(credentials, { from, to, parcel }) {
  let payload;
  try {
    payload = /** @type {Record<string, any>} */ (
      await yandexDeliveryRequest(credentials, {
        api: "express",
        path: "/check-price",
        body: {
          items: [parcel],
          route_points: [
            { coordinates: [from.lon, from.lat] },
            { coordinates: [to.lon, to.lat] },
          ],
          requirements: { taxi_class: EXPRESS_TAXI_CLASS },
        },
      })
    );
  } catch (error) {
    // Зона не обслуживается, маршрут слишком длинный и т.п. — Яндекс отвечает 4xx.
    if (error instanceof AppError && error.statusCode === 502) {
      throw new AppError(409, YANDEX_EXPRESS_UNAVAILABLE_MESSAGE);
    }
    throw error;
  }
  const price = Number.parseFloat(String(payload?.price ?? ""));
  if (!Number.isFinite(price))
    throw new AppError(409, YANDEX_EXPRESS_UNAVAILABLE_MESSAGE);
  const eta = Number(payload?.eta);
  return {
    // Вверх до рубля: покупатель платит курьеру целую сумму.
    deliverySumRub: Math.ceil(price),
    etaMinutes: Number.isFinite(eta) ? Math.round(eta) : null,
  };
}

/**
 * Расчёт для корзины. Не подключено — не ошибка, просто нет варианта.
 *
 * @param {{ items: Array<{ productId: string; quantity: number }>; toLat: number; toLon: number }} input
 */
export async function quoteYandexExpress({ items, toLat, toLon }) {
  const { sellerId, lines } = await loadLines(items);
  let setup;
  try {
    setup = await resolveExpressSetup(sellerId, { forBuyer: true });
  } catch (error) {
    const known = [
      YANDEX_DELIVERY_NOT_CONNECTED_MESSAGE,
      YANDEX_DELIVERY_DISABLED_MESSAGE,
      YANDEX_EXPRESS_NOT_READY_MESSAGE,
    ];
    if (error instanceof AppError && known.includes(error.message)) {
      return { available: false, reason: "not_ready" };
    }
    throw error;
  }
  try {
    const quote = await checkExpressPrice(setup.credentials, {
      from: setup.pickup,
      to: { lat: toLat, lon: toLon },
      parcel: buildExpressParcel(lines),
    });
    return { available: true, sellerId, ...quote };
  } catch (error) {
    if (
      error instanceof AppError &&
      error.message === YANDEX_EXPRESS_UNAVAILABLE_MESSAGE
    ) {
      return { available: false, reason: "unavailable" };
    }
    throw error;
  }
}

/**
 * Проверка «Экспресса» при оформлении: цену пересчитываем сами по
 * проверенным координатам адреса покупателя.
 *
 * @param {{
 *   sellerId: string;
 *   items: Array<{ productId: string; quantity: number }>;
 *   selection: { recipient: { name: string; phone: string } };
 *   deliveryAddress: { displayAddress: string; flat?: string };
 *   deliveryGeo: { lat: number; lon: number } | null;
 * }} input
 */
export async function resolveYandexExpressOrderShipment({
  sellerId,
  items,
  selection,
  deliveryAddress,
  deliveryGeo,
}) {
  if (
    !deliveryGeo ||
    !Number.isFinite(deliveryGeo.lat) ||
    !Number.isFinite(deliveryGeo.lon)
  ) {
    throw new AppError(400, YANDEX_EXPRESS_GEO_REQUIRED_MESSAGE);
  }
  const setup = await resolveExpressSetup(sellerId, { forBuyer: true });
  const { lines } = await loadLines(items);
  const quote = await checkExpressPrice(setup.credentials, {
    from: setup.pickup,
    to: deliveryGeo,
    parcel: buildExpressParcel(lines),
  });
  return {
    deliverySumRub: quote.deliverySumRub,
    etaMinutes: quote.etaMinutes,
    environment: setup.credentials.environment,
    pickup: setup.pickup,
    dropoff: {
      address: deliveryAddress.displayAddress,
      flat: String(deliveryAddress.flat ?? ""),
      lat: deliveryGeo.lat,
      lon: deliveryGeo.lon,
    },
    recipient: { name: selection.recipient.name, phone: selection.recipient.phone },
  };
}

/**
 * @param {Record<string, any>} order
 * @param {string} sellerId
 */
function findExpressShipment(order, sellerId) {
  return (
    (order?.shipments ?? []).find(
      (row) =>
        String(row?.sellerId) === String(sellerId) && row?.yandexExpressShipmentAtOrder,
    ) ?? null
  );
}

/**
 * @param {{ orderId: string; sellerId: string }} params
 */
async function loadSellerOrder({ orderId, sellerId }) {
  const order = await OrderModel.findById(orderId).lean();
  if (!order) throw new AppError(404, "Заказ не найден");
  const shipment = findExpressShipment(order, sellerId);
  if (!shipment)
    throw new AppError(404, "В этом заказе нет вашей отправки «Экспрессом»");
  return { order, shipment };
}

/**
 * @param {string} orderId
 * @param {string} sellerId
 * @param {Record<string, unknown>} claim
 */
async function saveClaim(orderId, sellerId, claim) {
  const set = { "shipments.$.yandexExpressClaim": claim };
  if (claim.claimId) set["shipments.$.shippingExternalId"] = String(claim.claimId);
  if (claim.sharingUrl) set.shippingTrackingUrl = String(claim.sharingUrl);
  await OrderModel.updateOne(
    { _id: orderId, "shipments.sellerId": sellerId },
    { $set: set },
  );
}

/**
 * Тело claims/create. Вынесено, чтобы проверить без Яндекса.
 *
 * @param {{
 *   order: Record<string, any>;
 *   shipment: Record<string, any>;
 *   productsById: Map<string, Record<string, any>>;
 *   sellerName: string;
 *   sellerInn?: string;
 * }} input
 */
export function buildExpressClaimBody({
  order,
  shipment,
  productsById,
  sellerName,
  sellerInn = "",
}) {
  const snapshot = shipment.yandexExpressShipmentAtOrder;
  const sellerId = String(shipment.sellerId);
  const fiscal = (itemType) => ({
    vat_code_str: "vat_none",
    item_type: itemType,
    ...(sellerInn ? { supplier_inn: sellerInn } : {}),
  });

  const items = (order.items ?? [])
    .filter(
      (item) => resolveItemSellerId(item) === sellerId && PRE_SHIPMENT.has(item.status),
    )
    .map((item) => {
      const productId = String(item.productId?._id ?? item.productId);
      const shipping = resolveProductShipping(productsById.get(productId));
      return {
        extra_id: productId,
        pickup_point: 1,
        dropoff_point: 2,
        title: String(item.productNameAtOrder ?? "Товар").slice(0, 255),
        // Сколько курьер возьмёт с покупателя за штуку.
        cost_value: Math.max(0, Number(item.unitPriceAtOrder) || 0).toFixed(2),
        cost_currency: "RUB",
        quantity: Math.max(1, Number(item.quantity) || 1),
        size: {
          length: Math.max(0.01, shipping.lengthCm / 100),
          width: Math.max(0.01, shipping.widthCm / 100),
          height: Math.max(0.01, shipping.heightCm / 100),
        },
        weight: Math.max(0.01, shipping.weightG / 1000),
        fiscalization: fiscal("product"),
      };
    });

  // Доставку покупатель платит курьеру вместе с товаром — отдельной строкой.
  if (Number(snapshot.deliverySumRub) > 0) {
    items.push({
      extra_id: "delivery",
      pickup_point: 1,
      dropoff_point: 2,
      title: "Доставка",
      cost_value: Number(snapshot.deliverySumRub).toFixed(2),
      cost_currency: "RUB",
      quantity: 1,
      size: { length: 0.01, width: 0.01, height: 0.01 },
      weight: 0.01,
      fiscalization: fiscal("service"),
    });
  }

  return {
    items,
    route_points: [
      {
        point_id: 1,
        visit_order: 1,
        type: "source",
        contact: { name: sellerName, phone: snapshot.pickup.phone },
        address: {
          fullname: snapshot.pickup.address,
          coordinates: [snapshot.pickup.lon, snapshot.pickup.lat],
        },
        // Курьер забирает только по коду: продавец видит его в карточке заказа.
        skip_confirmation: false,
      },
      {
        point_id: 2,
        visit_order: 2,
        type: "destination",
        contact: { name: snapshot.recipient.name, phone: snapshot.recipient.phone },
        address: {
          fullname: snapshot.dropoff.address,
          coordinates: [snapshot.dropoff.lon, snapshot.dropoff.lat],
          ...(snapshot.dropoff.flat ? { sflat: snapshot.dropoff.flat } : {}),
        },
        external_order_id: `${String(order._id)}-${sellerId.slice(-6)}`,
        payment_on_delivery: {
          payment_method: "card",
          customer: { phone: snapshot.recipient.phone },
        },
      },
    ],
    client_requirements: { taxi_class: EXPRESS_TAXI_CLASS },
  };
}

/**
 * @param {unknown} payload ответ claims/info
 */
export function readExpressClaimInfo(payload) {
  const row = /** @type {Record<string, any>} */ (payload ?? {});
  const price = row.pricing?.final_price ?? row.pricing?.offer?.price ?? null;
  const errors = Array.isArray(row.error_messages) ? row.error_messages : [];
  return {
    status: row.status ? String(row.status) : null,
    version: Number.isFinite(Number(row.version)) ? Number(row.version) : null,
    priceRub: price != null && Number.isFinite(Number(price)) ? Number(price) : null,
    error: errors.length
      ? errors
          .map((error) => error?.message ?? error?.code ?? "")
          .join("; ")
          .slice(0, 300)
      : null,
  };
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Вызвать курьера: создать заявку, дождаться оценки и подтвердить. Яндекс даёт
 * 10 минут на подтверждение — ждём оценки прямо в запросе продавца (обычно
 * секунды), не успели — подтвердит «Обновить статус» или опрос.
 *
 * @param {{ orderId: string; sellerId: string; sleepFn?: (ms: number) => Promise<unknown> }} params
 */
export async function createYandexExpressClaim({ orderId, sellerId, sleepFn = sleep }) {
  const { order, shipment } = await loadSellerOrder({ orderId, sellerId });
  const current = shipment.yandexExpressClaim;
  if (current?.claimId && !EXPRESS_RETRYABLE.has(String(current.status))) {
    throw new AppError(409, "Курьер Яндекса по этому заказу уже вызван");
  }

  const setup = await resolveExpressSetup(sellerId);
  const productIds = (order.items ?? [])
    .filter((item) => resolveItemSellerId(item) === String(sellerId))
    .map((item) => item.productId);
  const [products, seller] = await Promise.all([
    ProductModel.find({ _id: { $in: productIds } })
      .select("productWeightG productLengthCm productWidthCm productHeightCm")
      .lean(),
    UserModel.findById(sellerId).select("sellerSafeDeal.inn").lean(),
  ]);
  const body = buildExpressClaimBody({
    order,
    shipment,
    productsById: new Map(products.map((row) => [String(row._id), row])),
    sellerName: setup.sellerName,
    sellerInn: String(seller?.sellerSafeDeal?.inn ?? "").trim(),
  });

  const created = /** @type {Record<string, any>} */ (
    await yandexDeliveryRequest(setup.credentials, {
      api: "express",
      path: "/claims/create",
      query: { request_id: randomUUID() },
      body,
    })
  );
  if (!created?.id) {
    throw new AppError(502, "Яндекс не принял вызов курьера — попробуйте ещё раз");
  }
  await saveClaim(orderId, sellerId, {
    claimId: String(created.id),
    status: created.status ? String(created.status) : "new",
    createdAt: new Date(),
    previous: current?.claimId
      ? { claimId: current.claimId, status: current.status }
      : null,
  });
  logServerEvent("yandex_express.claim_created", {
    orderId: String(orderId),
    claimId: String(created.id),
  });

  // Оценка занимает секунды: ждём её здесь, чтобы сразу подтвердить.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const claim = await refreshYandexExpressClaim({ orderId, sellerId });
    if (claim.status !== "new" && claim.status !== "estimating") return claim;
    await sleepFn(2000);
  }
  return refreshYandexExpressClaim({ orderId, sellerId });
}

/**
 * Состояние заявки: подтверждаем оценённую, достаём код передачи курьеру и
 * ссылку отслеживания, двигаем заказ.
 *
 * @param {{ orderId: string; sellerId: string }} params
 */
export async function refreshYandexExpressClaim({ orderId, sellerId }) {
  const { shipment } = await loadSellerOrder({ orderId, sellerId });
  const current = shipment.yandexExpressClaim;
  if (!current?.claimId) throw new AppError(404, "Курьер ещё не вызван");
  const { credentials } = await resolveExpressSetup(sellerId);
  const claimQuery = { claim_id: current.claimId };
  const ask = (path, body = {}) =>
    yandexDeliveryRequest(credentials, {
      api: "express",
      path,
      query: claimQuery,
      body,
    });

  let info = readExpressClaimInfo(await ask("/claims/info"));
  if (info.status === "ready_for_approval" && !current.acceptedAt) {
    await ask("/claims/accept", { version: info.version });
    current.acceptedAt = new Date();
    info = readExpressClaimInfo(await ask("/claims/info"));
  }

  let pickupCode = null;
  if (info.status === "ready_for_pickup_confirmation") {
    const code = /** @type {any} */ (
      await ask("/claims/confirmation_code", { claim_id: current.claimId })
    );
    pickupCode = code?.code ? String(code.code) : null;
  }

  let sharingUrl = current.sharingUrl ?? null;
  if (!sharingUrl && current.acceptedAt) {
    const links = /** @type {any} */ (
      await yandexDeliveryRequest(credentials, {
        api: "express",
        method: "GET",
        path: "/claims/tracking-links",
        query: claimQuery,
      }).catch(() => null)
    );
    const destination = (links?.route_points ?? []).find(
      (row) => row?.type === "destination",
    );
    sharingUrl = destination?.sharing_link ? String(destination.sharing_link) : null;
  }

  const claim = {
    ...current,
    status: info.status ?? current.status ?? null,
    version: info.version ?? current.version ?? null,
    priceRub: info.priceRub ?? current.priceRub ?? null,
    error: info.error,
    pickupCode,
    sharingUrl,
    syncedAt: new Date(),
  };
  await saveClaim(orderId, sellerId, claim);

  await applyCarrierStepToOrder({
    orderId,
    sellerId,
    step: resolveOrderStepForExpressStatus(claim.status),
    carrier: SHIPPING_PROVIDER_YANDEX_EXPRESS,
    statusCode: claim.status,
  });
  if (EXPRESS_RETURNED.has(String(claim.status))) {
    await applyCarrierReturnToOrder({
      orderId,
      sellerId,
      carrier: SHIPPING_PROVIDER_YANDEX_EXPRESS,
    });
  }
  return claim;
}

/**
 * Снять курьера, когда заказ у нас отменили. Бесплатно Яндекс отменяет, пока
 * курьер не найден; дальше — платно, после забора — нельзя.
 *
 * @param {{ orderId: string; sellerId: string }} input
 */
export async function cancelYandexExpressClaim({ orderId, sellerId }) {
  const order = await OrderModel.findById(orderId).select("shipments").lean();
  const shipment = order ? findExpressShipment(order, sellerId) : null;
  const current = shipment?.yandexExpressClaim;
  if (
    !current?.claimId ||
    current.cancelledAt ||
    EXPRESS_FINAL.has(String(current.status))
  ) {
    return { ok: true, skipped: true };
  }
  try {
    const { credentials } = await resolveExpressSetup(sellerId);
    const query = { claim_id: current.claimId };
    const ask = (path, body = {}) =>
      yandexDeliveryRequest(credentials, { api: "express", path, query, body });
    const cancelInfo = /** @type {any} */ (await ask("/claims/cancel-info"));
    const cancelState = String(cancelInfo?.cancel_state ?? "");
    if (!cancelState || cancelState === "unavailable") {
      throw new Error("курьер уже забрал заказ");
    }
    const info = readExpressClaimInfo(await ask("/claims/info"));
    await ask("/claims/cancel", { cancel_state: cancelState, version: info.version });
    await saveClaim(orderId, sellerId, {
      ...current,
      cancelledAt: new Date(),
      cancelState,
      cancelError: null,
    });
    return { ok: true, cancelState };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await saveClaim(orderId, sellerId, {
      ...current,
      cancelError: message.slice(0, 300),
    });
    logServerEvent("yandex_express.claim_cancel_failed", {
      orderId: String(orderId),
      error: message,
    });
    return { ok: false, reason: message };
  }
}

const SYNC_BATCH_LIMIT = 30;

/** Один проход опроса заявок «Экспресса». */
export async function syncYandexExpressClaims({ limit = SYNC_BATCH_LIMIT } = {}) {
  const finals = [...EXPRESS_FINAL];
  const orders = await OrderModel.find({
    shipments: {
      $elemMatch: {
        "yandexExpressClaim.claimId": { $exists: true, $nin: ["", null] },
        "yandexExpressClaim.status": { $nin: finals },
        "yandexExpressClaim.cancelledAt": { $in: [null] },
      },
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
      const claim = shipment?.yandexExpressClaim;
      if (!claim?.claimId || claim.cancelledAt || finals.includes(claim.status))
        continue;
      checked += 1;
      try {
        await refreshYandexExpressClaim({
          orderId: String(order._id),
          sellerId: String(shipment.sellerId),
        });
      } catch (error) {
        failed += 1;
        logServerEvent("yandex_express.claim_sync_failed", {
          orderId: String(order._id),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  return { checked, failed };
}
