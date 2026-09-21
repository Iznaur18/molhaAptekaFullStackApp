import {
  CDEK_DELIVERY_MODE_POINT_TO_POINT,
  CDEK_ORDER_TYPE_SHOP,
  CDEK_SHIPMENT_POINT_REQUIRED_MESSAGE,
  CDEK_WAYBILL_EXISTS_MESSAGE,
  resolveProductShipping,
} from "@molha/api-contract";

import { ORDER_PAYMENT_METHOD_CARD_PREPAID } from "../../../constants/orderConstants.js";
import { AppError } from "../../../errors/AppError.js";
import { OrderModel, ProductModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

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
    delivery_recipient_cost: { value: Math.max(0, Number(snapshot.deliverySumRub) || 0) },
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
 * @param {unknown} payload ответ `GET /v2/orders/{uuid}`
 */
function readCdekOrderState(payload) {
  const entity = /** @type {Record<string, any>} */ (payload)?.entity ?? {};
  const requests = Array.isArray(/** @type {any} */ (payload)?.requests)
    ? /** @type {any} */ (payload).requests
    : [];
  const invalid = requests.find((request) => request?.state === "INVALID");
  const errors = Array.isArray(invalid?.errors) ? invalid.errors : [];
  const statuses = Array.isArray(entity.statuses) ? entity.statuses : [];
  return {
    cdekNumber: entity.cdek_number ? String(entity.cdek_number) : null,
    status: statuses[0]?.name ? String(statuses[0].name) : null,
    error: errors.length
      ? errors.map((error) => error?.message ?? error?.code ?? "").join("; ").slice(0, 500)
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
export async function createCdekWaybill({ orderId, sellerId, shipmentPointCode = null }) {
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
  logServerEvent("cdek.waybill_created", { orderId: String(orderId), uuid: waybill.uuid });

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
    error: state.error,
    syncedAt: new Date(),
  };
  await saveWaybill(orderId, sellerId, waybill);
  return waybill;
}
