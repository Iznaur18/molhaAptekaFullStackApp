import { ORDER_FULFILLMENT_DELIVERY } from "@molha/api-contract";

import {
  COURIER_DECLINED_MESSAGE,
  COURIER_DISPUTE_ALREADY_OPEN_MESSAGE,
  COURIER_DISPUTE_REASON_MAX_LENGTH,
  COURIER_DISPUTE_TOO_EARLY_MESSAGE,
  COURIER_STUCK_SHIPMENT_HOURS,
  IN_APP_NOTIFICATION_KIND_COURIER_DECLINED,
  IN_APP_NOTIFICATION_KIND_SHIPMENT_DISPUTED,
  SHIPMENT_DISPUTED_MESSAGE,
} from "../../constants/courierConstants.js";
import {
  ORDER_STATUS_COURIER_ASSIGNED,
  ORDER_STATUS_COURIER_HOLDING,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_DISPUTED,
  ORDER_STATUS_IN_DELIVERY,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_TERMINAL_STATUSES,
} from "../../constants/orderConstants.js";
import { AppError } from "../../errors/AppError.js";
import { OrderModel, UserModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import {
  loadOrderWithItems,
  normalizeId,
  populateOrderForResponse,
} from "../order/orderItemStatusHelpers.js";
import { resolveItemSellerId } from "../order/orderShipments.js";
import { buildOrderStatusFromItems } from "../order/orderStatus.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

const TERMINAL = new Set(ORDER_TERMINAL_STATUSES);

/** Отсюда товар уже у курьера — пропажа становится спором, а не отказом. */
const DISPUTABLE_STATUSES = new Set([
  ORDER_STATUS_COURIER_HOLDING,
  ORDER_STATUS_IN_DELIVERY,
  ORDER_STATUS_DELIVERED,
]);

/**
 * @param {any} order
 * @param {string} sellerId
 */
const locate = (order, sellerId) => {
  const items = (order.items ?? []).filter(
    (item) =>
      resolveItemSellerId(item) === String(sellerId) && !TERMINAL.has(item.status),
  );
  const shipment = (order.shipments ?? []).find(
    (row) => row?.sellerId != null && String(row.sellerId) === String(sellerId),
  );
  if (items.length === 0 || !shipment) {
    throw new AppError(404, "Отправление не найдено");
  }
  if (shipment.fulfillmentMethod !== ORDER_FULFILLMENT_DELIVERY) {
    throw new AppError(409, "Это отправление забирают самовывозом");
  }
  return { shipment, items, status: buildOrderStatusFromItems(items) };
};

/**
 * Уведомление не часть сделки: упавший пуш не должен откатывать спор.
 *
 * @param {unknown} userId
 * @param {string} kind
 * @param {string} message
 * @param {unknown} orderId
 */
const notify = async (userId, kind, message, orderId) => {
  if (!userId) return;
  try {
    await createUserInAppNotification({ userId: String(userId), kind, message });
  } catch (error) {
    logServerEvent("error", {
      event: "notify_courier_dispute_failed",
      orderId: String(orderId ?? ""),
      ...formatLogError(error),
    });
  }
};

/**
 * Курьер отказывается от принятой заявки — до того, как забрал товар.
 *
 * Это не отмена заказа: у продавца ничего не изменилось, отправление просто
 * возвращается в общий список. Если считать это отменой, один недобросовестный
 * курьер смог бы убивать чужие заказы.
 *
 * @param {{ orderId: string; sellerId: string; courierId: string }} input
 */
export async function declineShipmentByCourier({ orderId, sellerId, courierId }) {
  const order = await loadOrderWithItems(orderId);
  const { shipment, items, status } = locate(order, sellerId);

  if (String(shipment.courierId ?? "") !== String(courierId)) {
    throw new AppError(403, "Это отправление взял другой курьер");
  }
  if (status !== ORDER_STATUS_COURIER_ASSIGNED) {
    throw new AppError(409, "Товар уже у вас — откажитесь через возврат");
  }

  shipment.courierId = null;
  shipment.courierAssignedAt = null;
  shipment.handoverCode = "";
  shipment.handoverAttempts = 0;
  shipment.declinedCourierIds = [
    ...(shipment.declinedCourierIds ?? []),
    courierId,
  ];

  for (const item of items) {
    item.status = ORDER_STATUS_READY_TO_SHIP;
  }
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();
  await populateOrderForResponse(order);

  // Штрафовать нечем — платформа не в потоке денег. Но статистику ведём:
  // иначе не отличить нормального курьера от того, кто берёт заявки ради
  // адресов и телефонов.
  await UserModel.updateOne(
    { _id: courierId },
    { $inc: { "courierProfile.declinedJobCount": 1 } },
  );

  await notify(
    order.userBuyerId?._id ?? order.userBuyerId,
    IN_APP_NOTIFICATION_KIND_COURIER_DECLINED,
    COURIER_DECLINED_MESSAGE,
    orderId,
  );

  return { order };
}

/**
 * Открыть спор: курьер не выходит на связь, товар вне контроля.
 *
 * Заводит продавец кнопкой или автотаймер. Позиции переходят в `disputed` —
 * остаток товара при этом на витрину не возвращается, иначе продадим то,
 * что неизвестно где.
 *
 * @param {{
 *   orderId: string;
 *   sellerId: string;
 *   requestUserId?: string | null;
 *   reason?: string;
 * }} input
 */
export async function openShipmentDispute({
  orderId,
  sellerId,
  requestUserId = null,
  reason = "",
}) {
  const order = await loadOrderWithItems(orderId);
  const { shipment, items, status } = locate(order, sellerId);

  // Без `requestUserId` спор открывает таймер — проверять права не у кого.
  if (requestUserId) {
    const buyerId = normalizeId(order.userBuyerId?._id ?? order.userBuyerId);
    const isParty =
      buyerId === String(requestUserId) || String(sellerId) === String(requestUserId);
    if (!isParty) {
      throw new AppError(403, "Спор открывают продавец и покупатель");
    }
  }

  if (status === ORDER_STATUS_DISPUTED) {
    throw new AppError(409, COURIER_DISPUTE_ALREADY_OPEN_MESSAGE);
  }
  if (!DISPUTABLE_STATUSES.has(status)) {
    throw new AppError(409, COURIER_DISPUTE_TOO_EARLY_MESSAGE);
  }

  shipment.disputeOpenedAt = new Date();
  shipment.disputeReason = String(reason ?? "")
    .trim()
    .slice(0, COURIER_DISPUTE_REASON_MAX_LENGTH);
  shipment.disputeOpenedBy = requestUserId ?? null;

  for (const item of items) {
    item.status = ORDER_STATUS_DISPUTED;
  }
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();
  await populateOrderForResponse(order);

  for (const userId of [
    order.userBuyerId?._id ?? order.userBuyerId,
    sellerId,
    shipment.courierId,
  ]) {
    await notify(
      userId,
      IN_APP_NOTIFICATION_KIND_SHIPMENT_DISPUTED,
      SHIPMENT_DISPUTED_MESSAGE,
      orderId,
    );
  }

  return { order };
}

/**
 * Отправления, зависшие у курьера дольше суток.
 *
 * Продавец заинтересован и заметит первым, но если он забил — спор поднимает
 * таймер. Функция ничего не меняет, только находит: применяет решение
 * вызывающий, чтобы это было видно в логе воркера.
 *
 * @param {{ now?: Date; hours?: number }} [options]
 */
export async function findStuckCourierShipments({
  now = new Date(),
  hours = COURIER_STUCK_SHIPMENT_HOURS,
} = {}) {
  const threshold = new Date(now.getTime() - hours * 60 * 60 * 1000);

  const orders = await OrderModel.find({
    shipments: {
      $elemMatch: {
        fulfillmentMethod: ORDER_FULFILLMENT_DELIVERY,
        courierId: { $ne: null },
        courierAssignedAt: { $lte: threshold },
      },
    },
  })
    .select("items shipments")
    .lean();

  const stuck = [];
  for (const order of orders) {
    for (const shipment of order.shipments ?? []) {
      if (!shipment.courierId || shipment.disputeOpenedAt) continue;
      if (!shipment.courierAssignedAt || shipment.courierAssignedAt > threshold) {
        continue;
      }

      const sellerId = String(shipment.sellerId);
      const items = (order.items ?? []).filter(
        (item) =>
          resolveItemSellerId(item) === sellerId && !TERMINAL.has(item.status),
      );
      if (items.length === 0) continue;
      if (!DISPUTABLE_STATUSES.has(buildOrderStatusFromItems(items))) continue;

      stuck.push({ orderId: String(order._id), sellerId });
    }
  }

  return stuck;
}

/**
 * Открытые споры для очереди модератора.
 *
 * @param {{ limit?: number }} [options]
 */
export async function listOpenDisputes({ limit = 50 } = {}) {
  const safeLimit = Math.min(200, Math.max(1, Math.floor(Number(limit) || 50)));

  const orders = await OrderModel.find({
    shipments: {
      $elemMatch: { disputeOpenedAt: { $ne: null }, disputeResolvedAt: null },
    },
  })
    .select("items shipments deliveryAddress createdAt userBuyerId")
    .populate("userBuyerId", "userName userPhoneNumber")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  // Модератору звонить обеим сторонам и курьеру, поэтому имена и телефоны
  // подтягиваем одним запросом на всех.
  const userIds = new Set();
  const rows = [];

  for (const order of orders) {
    for (const shipment of order.shipments ?? []) {
      if (!shipment.disputeOpenedAt || shipment.disputeResolvedAt) continue;

      const sellerId = String(shipment.sellerId);
      const courierId = shipment.courierId ? String(shipment.courierId) : "";
      userIds.add(sellerId);
      if (courierId) userIds.add(courierId);
      rows.push({
        orderId: String(order._id),
        sellerId,
        courierId,
        openedAt: shipment.disputeOpenedAt,
        reason: shipment.disputeReason ?? "",
        deliveryFeeRub: Number(shipment.deliveryFeeRub) || 0,
        buyerName: order.userBuyerId?.userName ?? "",
        buyerPhone: order.userBuyerId?.userPhoneNumber ?? "",
        items: (order.items ?? [])
          .filter((item) => resolveItemSellerId(item) === sellerId)
          .map((item) => ({
            name: item.productNameAtOrder,
            quantity: item.quantity,
            status: item.status,
          })),
      });
    }
  }

  const users = await UserModel.find({ _id: { $in: [...userIds] } })
    .select("userName userPhoneNumber")
    .lean();
  const byId = new Map(users.map((row) => [String(row._id), row]));

  for (const row of rows) {
    const seller = byId.get(row.sellerId);
    row.sellerName = seller?.userName ?? "";
    row.sellerPhone = seller?.userPhoneNumber ?? "";
    const courier = row.courierId ? byId.get(row.courierId) : null;
    row.courierName = courier?.userName ?? "";
    row.courierPhone = courier?.userPhoneNumber ?? "";
  }

  return { disputes: rows };
}

/**
 * Модератор закрывает спор.
 *
 * Позиции переводятся туда, куда решил модератор: вернулись продавцу или
 * всё-таки дошли до покупателя. Отдельного «правильного» исхода тут нет —
 * товар был вне контроля, и решение принимает человек.
 *
 * @param {{ orderId: string; sellerId: string; outcome: "returned" | "confirmed"; moderatorId: string }} input
 */
export async function resolveShipmentDispute({
  orderId,
  sellerId,
  outcome,
  moderatorId,
}) {
  const order = await loadOrderWithItems(orderId);
  const { shipment, items, status } = locate(order, sellerId);

  if (status !== ORDER_STATUS_DISPUTED) {
    throw new AppError(409, "По этому отправлению спора нет");
  }

  shipment.disputeResolvedAt = new Date();

  const { markOrderItemReturned } = await import(
    "../order/updateOrderItemStatus.js"
  );
  const { confirmOrderItemByBuyer } = await import(
    "../order/updateOrderItemStatus.js"
  );

  // Возвращаем позиции в состояние, из которого штатные сервисы умеют
  // работать: они несут снятие резерва, баллы и счётчик продаж.
  const bridgeStatus = outcome === "confirmed" ? ORDER_STATUS_DELIVERED : ORDER_STATUS_IN_DELIVERY;
  for (const item of items) {
    item.status = bridgeStatus;
  }
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();

  const buyerId = normalizeId(order.userBuyerId?._id ?? order.userBuyerId);
  const indexes = items.map((item) => item.itemIndex);
  let latest = null;

  for (const itemIndex of indexes) {
    latest =
      outcome === "confirmed"
        ? await confirmOrderItemByBuyer({
            orderId: String(orderId),
            itemIndex,
            buyerId,
            userId: buyerId,
          })
        : await markOrderItemReturned({
            orderId: String(orderId),
            itemIndex,
            requestUserId: String(sellerId),
          });
  }

  logServerEvent("info", {
    event: "courier_dispute_resolved",
    orderId: String(orderId),
    sellerId: String(sellerId),
    outcome,
    moderatorId: String(moderatorId),
  });

  return { order: latest?.order ?? order };
}
