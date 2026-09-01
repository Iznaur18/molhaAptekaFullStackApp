import { ORDER_FULFILLMENT_DELIVERY } from "@molha/api-contract";

import {
  COURIER_IS_ORDER_PARTY_MESSAGE,
  COURIER_NOT_APPROVED_MESSAGE,
  COURIER_MODERATION_APPROVED,
} from "../../constants/courierConstants.js";
import {
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
  ORDER_STATUS_COURIER_ASSIGNED,
  ORDER_STATUS_COURIER_HOLDING,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_IN_DELIVERY,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_TERMINAL_STATUSES,
} from "../../constants/orderConstants.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { notifyBuyerAboutOrderItemStatus } from "../order/notifyBuyerAboutOrderItemStatus.js";
import {
  loadOrderWithItems,
  populateOrderForResponse,
} from "../order/orderItemStatusHelpers.js";
import { resolveItemSellerId } from "../order/orderShipments.js";
import {
  confirmOrderItemByBuyer,
  markOrderItemDeliveredBySeller,
} from "../order/updateOrderItemStatus.js";
import { buildOrderStatusFromItems } from "../order/orderStatus.js";

import {
  generateHandoverCode,
  verifyHandoverCode,
} from "./courierHandoverCodes.js";

const TERMINAL = new Set(ORDER_TERMINAL_STATUSES);

/**
 * Находит отправление и его живые позиции.
 *
 * @param {any} order
 * @param {string} sellerId
 */
const locateShipment = (order, sellerId) => {
  const items = (order.items ?? []).filter(
    (item) =>
      resolveItemSellerId(item) === String(sellerId) && !TERMINAL.has(item.status),
  );
  if (items.length === 0) {
    throw new AppError(404, "Отправление не найдено");
  }

  const shipment = (order.shipments ?? []).find(
    (row) => row?.sellerId != null && String(row.sellerId) === String(sellerId),
  );
  if (!shipment) {
    throw new AppError(404, "Отправление не найдено");
  }
  if (shipment.fulfillmentMethod !== ORDER_FULFILLMENT_DELIVERY) {
    throw new AppError(409, "Это отправление забирают самовывозом");
  }
  if (shipment.courierDelivery !== true) {
    throw new AppError(409, "Это отправление продавец везёт сам");
  }

  return { shipment, items, status: buildOrderStatusFromItems(items) };
};

/** @param {any} order @param {any} items @param {string} nextStatus */
const applyStatus = async (order, items, nextStatus) => {
  for (const item of items) {
    item.status = nextStatus;
  }
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();
  await populateOrderForResponse(order);
};

/**
 * @param {any} order
 * @param {any} items
 * @param {string} status
 * @param {string} actorUserId
 */
const notifyBuyer = (order, items, status, actorUserId) =>
  notifyBuyerAboutOrderItemStatus({
    buyerUserId: order.userBuyerId?._id ?? order.userBuyerId,
    actorUserId,
    status,
    productName: items.length === 1 ? items[0].productNameAtOrder : "",
    orderId: order._id,
  });

/** @param {string} courierId */
const assertApprovedCourier = async (courierId) => {
  const user = await UserModel.findById(courierId)
    .select("courierProfile.moderationStatus")
    .lean();
  if (user?.courierProfile?.moderationStatus !== COURIER_MODERATION_APPROVED) {
    throw new AppError(403, COURIER_NOT_APPROVED_MESSAGE);
  }
};

/**
 * Курьер берёт отправление из «Обзора».
 *
 * @param {{ orderId: string; sellerId: string; courierId: string }} input
 */
export async function acceptShipmentByCourier({ orderId, sellerId, courierId }) {
  await assertApprovedCourier(courierId);

  const order = await loadOrderWithItems(orderId);
  const { shipment, items, status } = locateShipment(order, sellerId);

  const buyerId = String(order.userBuyerId?._id ?? order.userBuyerId ?? "");
  if (String(courierId) === String(sellerId) || String(courierId) === buyerId) {
    throw new AppError(403, COURIER_IS_ORDER_PARTY_MESSAGE);
  }

  // Занятость проверяем раньше статуса: опоздавшему курьеру важно услышать
  // «уже взяли», а не «не готов к отгрузке» — статус к этому моменту уже ушёл.
  if (shipment.courierId) {
    throw new AppError(409, "Отправление уже взял другой курьер");
  }
  if (status !== ORDER_STATUS_READY_TO_SHIP) {
    throw new AppError(409, "Заказ ещё не готов к отгрузке");
  }
  if (
    (shipment.declinedCourierIds ?? []).some(
      (id) => String(id) === String(courierId),
    )
  ) {
    throw new AppError(403, "По этому заказу вам отказали");
  }

  shipment.courierId = courierId;
  shipment.courierAssignedAt = new Date();
  await applyStatus(order, items, ORDER_STATUS_COURIER_ASSIGNED);
  await notifyBuyer(order, items, ORDER_STATUS_COURIER_ASSIGNED, courierId);

  return { order };
}

/**
 * Продавец выдаёт код передачи.
 *
 * Код возвращается только продавцу: он показывает его курьеру вживую, и это
 * единственное доказательство, что они правда стоят рядом.
 *
 * @param {{ orderId: string; sellerId: string }} input
 */
export async function issueHandoverCode({ orderId, sellerId }) {
  const order = await loadOrderWithItems(orderId);
  const { shipment, status } = locateShipment(order, sellerId);

  if (status !== ORDER_STATUS_COURIER_ASSIGNED) {
    throw new AppError(409, "Код нужен, когда курьер приехал за заказом");
  }

  shipment.handoverCode = generateHandoverCode();
  shipment.handoverCodeIssuedAt = new Date();
  shipment.handoverAttempts = 0;
  await order.save();

  return { code: shipment.handoverCode };
}

/**
 * Курьер вводит код продавца — товар переходит к нему.
 *
 * @param {{ orderId: string; sellerId: string; courierId: string; code: string }} input
 */
export async function confirmHandoverByCourier({
  orderId,
  sellerId,
  courierId,
  code,
}) {
  const order = await loadOrderWithItems(orderId);
  const { shipment, items, status } = locateShipment(order, sellerId);

  if (String(shipment.courierId ?? "") !== String(courierId)) {
    throw new AppError(403, "Это отправление взял другой курьер");
  }
  if (status !== ORDER_STATUS_COURIER_ASSIGNED) {
    throw new AppError(409, "Передача уже подтверждена");
  }

  const result = verifyHandoverCode({
    expected: shipment.handoverCode,
    received: code,
    attempts: shipment.handoverAttempts,
  });
  shipment.handoverAttempts = result.attempts;

  if (!result.ok) {
    // Попытку сохраняем и только потом отвечаем ошибкой.
    await order.save();
    throw result.error;
  }

  shipment.handoverCode = "";
  await applyStatus(order, items, ORDER_STATUS_COURIER_HOLDING);
  await notifyBuyer(order, items, ORDER_STATUS_COURIER_HOLDING, courierId);

  return { order };
}

/**
 * Курьер поехал.
 *
 * @param {{ orderId: string; sellerId: string; courierId: string }} input
 */
export async function startDeliveryByCourier({ orderId, sellerId, courierId }) {
  const order = await loadOrderWithItems(orderId);
  const { shipment, items, status } = locateShipment(order, sellerId);

  if (String(shipment.courierId ?? "") !== String(courierId)) {
    throw new AppError(403, "Это отправление взял другой курьер");
  }
  if (status !== ORDER_STATUS_COURIER_HOLDING) {
    throw new AppError(409, "Сначала заберите заказ у продавца");
  }

  await applyStatus(order, items, ORDER_STATUS_IN_DELIVERY);
  await notifyBuyer(order, items, ORDER_STATUS_IN_DELIVERY, courierId);

  return { order };
}

/**
 * Курьер привёз: выдаётся код вручения, который называет покупатель.
 *
 * @param {{ orderId: string; sellerId: string; courierId: string }} input
 */
export async function markArrivedByCourier({ orderId, sellerId, courierId }) {
  const order = await loadOrderWithItems(orderId);
  const { shipment, items, status } = locateShipment(order, sellerId);

  if (String(shipment.courierId ?? "") !== String(courierId)) {
    throw new AppError(403, "Это отправление взял другой курьер");
  }
  if (status !== ORDER_STATUS_IN_DELIVERY) {
    throw new AppError(409, "Отметьте сначала, что выехали");
  }

  shipment.deliveryCode = generateHandoverCode();
  shipment.deliveryCodeIssuedAt = new Date();
  shipment.deliveryAttempts = 0;
  await order.save();

  // Через штатный сервис, а не прямой записью статуса: на «Доставлен» висит
  // счётчик продаж товара, дублировать его здесь нельзя.
  const indexes = items.map((item) => item.itemIndex);
  let latest = null;
  for (const itemIndex of indexes) {
    latest = await markOrderItemDeliveredBySeller({
      orderId: String(orderId),
      itemIndex,
      sellerId: String(sellerId),
      userId: courierId,
    });
  }
  await notifyBuyer(order, items, ORDER_STATUS_DELIVERED, courierId);

  return { order: latest?.order ?? order };
}

/**
 * Курьер вводит код покупателя — сделка закрыта.
 *
 * Это заодно чинит старую проблему: покупатель, который не нажимает
 * «Подтвердить получение», держал резерв товара бесконечно.
 *
 * @param {{ orderId: string; sellerId: string; courierId: string; code: string }} input
 */
export async function completeDeliveryByCourier({
  orderId,
  sellerId,
  courierId,
  code,
}) {
  const order = await loadOrderWithItems(orderId);
  const { shipment, items, status } = locateShipment(order, sellerId);

  if (String(shipment.courierId ?? "") !== String(courierId)) {
    throw new AppError(403, "Это отправление взял другой курьер");
  }
  if (status !== ORDER_STATUS_DELIVERED) {
    throw new AppError(409, "Сначала отметьте, что привезли заказ");
  }
  // Курьер не касается денег продавца: без его подтверждения перевода товар
  // отдавать нельзя.
  if (
    order.paymentMethod === ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY &&
    !shipment.paymentConfirmedAt
  ) {
    throw new AppError(409, "Продавец ещё не подтвердил оплату");
  }

  const result = verifyHandoverCode({
    expected: shipment.deliveryCode,
    received: code,
    attempts: shipment.deliveryAttempts,
  });
  shipment.deliveryAttempts = result.attempts;

  if (!result.ok) {
    await order.save();
    throw result.error;
  }

  shipment.deliveryCode = "";
  await order.save();

  // Покупатель назвал свой код — значит он рядом и получил товар. Дальше
  // штатное подтверждение: на нём висят баллы, партнёрская выплата, розыгрыш
  // и закрытие аукциона.
  const buyerId = String(order.userBuyerId?._id ?? order.userBuyerId);
  const indexes = items.map((item) => item.itemIndex);
  let latest = null;
  for (const itemIndex of indexes) {
    latest = await confirmOrderItemByBuyer({
      orderId: String(orderId),
      itemIndex,
      buyerId,
      userId: buyerId,
    });
  }

  return { order: latest?.order ?? order };
}

/**
 * Продавец подтверждает, что перевод дошёл.
 *
 * Курьер денег продавца не касается, поэтому перед вручением нужно третье
 * рукопожатие: покупатель перевёл → продавец подтвердил → курьер отдал.
 *
 * @param {{ orderId: string; sellerId: string; confirmed: boolean }} input
 */
export async function setShipmentPaymentConfirmed({ orderId, sellerId, confirmed }) {
  const order = await loadOrderWithItems(orderId);
  const { shipment, status } = locateShipment(order, sellerId);

  if (order.paymentMethod !== ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY) {
    throw new AppError(409, "Этот заказ оплачивается иначе");
  }
  // Откат возможен, пока курьер не запросил код вручения: после этого товар
  // уже отдан, и отменять нечего — только спор.
  if (!confirmed && status !== ORDER_STATUS_DELIVERED && shipment.paymentConfirmedAt) {
    shipment.paymentConfirmedAt = null;
    await order.save();
    await populateOrderForResponse(order);
    return { order };
  }
  if (!confirmed) {
    throw new AppError(409, "Отменить подтверждение оплаты уже нельзя");
  }
  if (status !== ORDER_STATUS_IN_DELIVERY && status !== ORDER_STATUS_DELIVERED) {
    throw new AppError(409, "Оплату подтверждают, когда курьер уже привёз заказ");
  }

  shipment.paymentConfirmedAt = new Date();
  await order.save();
  await populateOrderForResponse(order);

  return { order };
}
