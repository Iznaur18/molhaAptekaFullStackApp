import { PRODUCT_DELIVERY_CARRIER_LOBO } from "@molha/api-contract";

import {
  LOBO_STATUS_CANCELLED,
  LOBO_STATUS_DELIVERED,
  LOBO_STATUS_PICKED_UP,
} from "../../../constants/loboConstants.js";
import {
  ORDER_STATUS_IN_DELIVERY,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_TERMINAL_STATUSES,
} from "../../../constants/orderConstants.js";
import { OrderModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";
import { notifyBuyerAboutOrderItemStatus } from "../../order/notifyBuyerAboutOrderItemStatus.js";
import { resolveItemSellerId } from "../../order/orderShipments.js";
import { buildOrderStatusFromItems } from "../../order/orderStatus.js";

import { getLoboOrderByExternalId, isLoboConfigured } from "./loboClient.js";

const TERMINAL = new Set(ORDER_TERMINAL_STATUSES);

/** Статусы службы, после которых опрашивать больше нечего. */
const FINAL_CARRIER_STATUSES = new Set([
  LOBO_STATUS_DELIVERED,
  LOBO_STATUS_CANCELLED,
]);

/**
 * Сколько отправлений опрашиваем за проход.
 *
 * У службы лимит 60 запросов в минуту на IP, и делить его с остальными
 * вызовами приходится нам: берём заведомо меньше.
 */
const BATCH_LIMIT = 20;

/**
 * Наша ступень по статусу службы.
 *
 * Промежуточные статусы (`assigned`, `accepted`, `arrived`) ничего не меняют
 * в лестнице: товар всё ещё у продавца, и покупателю сообщать нечего.
 *
 * @param {string} carrierStatus
 * @returns {string | null}
 */
export function resolveLadderStatusForCarrier(carrierStatus) {
  if (carrierStatus === LOBO_STATUS_PICKED_UP) return ORDER_STATUS_IN_DELIVERY;
  if (carrierStatus === LOBO_STATUS_DELIVERED) return "delivered";
  return null;
}

/**
 * Отправления, за которыми ещё надо следить.
 *
 * @param {{ limit?: number }} [options]
 */
export async function findLoboShipmentsToSync({ limit = BATCH_LIMIT } = {}) {
  const orders = await OrderModel.find({
    shipments: {
      $elemMatch: {
        shippingProvider: PRODUCT_DELIVERY_CARRIER_LOBO,
        shippingExternalId: { $nin: ["", null] },
        shippingCarrierStatus: { $nin: [...FINAL_CARRIER_STATUSES] },
      },
    },
  })
    .select("items shipments")
    .sort({ updatedAt: 1 })
    .limit(limit)
    .lean();

  const rows = [];
  for (const order of orders) {
    for (const shipment of order.shipments ?? []) {
      if (shipment?.shippingProvider !== PRODUCT_DELIVERY_CARRIER_LOBO) continue;
      if (!shipment.shippingExternalId) continue;
      if (FINAL_CARRIER_STATUSES.has(shipment.shippingCarrierStatus)) continue;
      rows.push({
        orderId: String(order._id),
        sellerId: String(shipment.sellerId),
        externalId: String(shipment.shippingExternalId),
        carrierStatus: String(shipment.shippingCarrierStatus ?? ""),
      });
    }
  }
  return rows;
}

/**
 * Двигает позиции отправления на нужную ступень.
 *
 * «Доставлен» пропускаем через штатный сервис продавца: он несёт счётчик
 * продаж и прочие эффекты, терять их из-за чужого статуса нельзя. Подтвердить
 * получение по-прежнему должен покупатель — служба за него не расписывается.
 *
 * @param {{ orderId: string; sellerId: string; ladderStatus: string }} input
 */
async function applyLadderStatus({ orderId, sellerId, ladderStatus }) {
  if (ladderStatus === "delivered") {
    const { markOrderItemDeliveredBySeller } = await import(
      "../../order/updateOrderItemStatus.js"
    );
    const order = await OrderModel.findById(orderId).select("items").lean();
    const indexes = (order?.items ?? [])
      .filter(
        (item) =>
          resolveItemSellerId(item) === String(sellerId) && !TERMINAL.has(item.status),
      )
      .map((item) => item.itemIndex);

    for (const itemIndex of indexes) {
      await markOrderItemDeliveredBySeller({
        orderId,
        itemIndex,
        sellerId,
        userId: sellerId,
      });
    }
    return indexes.length;
  }

  const order = await OrderModel.findById(orderId);
  if (!order) return 0;
  const items = (order.items ?? []).filter(
    (item) =>
      resolveItemSellerId(item) === String(sellerId) && !TERMINAL.has(item.status),
  );
  if (items.length === 0) return 0;

  for (const item of items) {
    item.status = ladderStatus;
  }
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();

  await notifyBuyerAboutOrderItemStatus({
    buyerUserId: order.userBuyerId,
    actorUserId: sellerId,
    status: ladderStatus,
    productName: items.length === 1 ? items[0].productNameAtOrder : "",
    orderId,
  });

  return items.length;
}

/**
 * Один проход опроса статусов.
 *
 * Вебхуков у службы нет, поэтому спрашиваем сами. Ошибка по одному
 * отправлению не останавливает остальные: чужой сервис отвечает как хочет.
 */
export async function syncLoboShipmentStatuses() {
  if (!isLoboConfigured()) return { checked: 0, moved: 0, failed: 0 };

  const rows = await findLoboShipmentsToSync();
  if (rows.length === 0) return { checked: 0, moved: 0, failed: 0 };

  let moved = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const remote = await getLoboOrderByExternalId(row.externalId);
      const carrierStatus = String(remote?.status ?? "");
      if (!carrierStatus || carrierStatus === row.carrierStatus) continue;

      const ladderStatus = resolveLadderStatusForCarrier(carrierStatus);
      if (ladderStatus) {
        moved += await applyLadderStatus({
          orderId: row.orderId,
          sellerId: row.sellerId,
          ladderStatus,
        });
      }

      // Статус службы пишем всегда — даже когда лестница не двинулась:
      // продавцу видно, что курьер назначен и едет.
      await OrderModel.updateOne(
        { _id: row.orderId, "shipments.shippingExternalId": row.externalId },
        {
          $set: {
            "shipments.$.shippingCarrierStatus": carrierStatus,
            "shipments.$.shippingSyncedAt": new Date(),
          },
        },
      );

      logServerEvent("info", {
        event: "lobo_status_synced",
        orderId: row.orderId,
        externalId: row.externalId,
        carrierStatus,
        ladderStatus: ladderStatus ?? "",
      });
    } catch (error) {
      failed += 1;
      logServerEvent("error", {
        event: "lobo_status_sync_failed",
        orderId: row.orderId,
        externalId: row.externalId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { checked: rows.length, moved, failed };
}

/**
 * Повторная передача отправлений, которые не удалось отдать службе.
 *
 * Продавец уже собрал заказ, а служба в тот момент не ответила — без этого
 * товар остался бы лежать без курьера, и никто бы не заметил.
 */
export async function retryPendingLoboHandovers() {
  if (!isLoboConfigured()) return { retried: 0 };

  const orders = await OrderModel.find({
    shipments: {
      $elemMatch: {
        deliveryCarrier: PRODUCT_DELIVERY_CARRIER_LOBO,
        shippingExternalId: { $in: ["", null] },
      },
    },
  })
    .select("items shipments")
    .limit(BATCH_LIMIT)
    .lean();

  const { handOverShipmentToLobo } = await import("./loboShipmentOrders.js");
  let retried = 0;

  for (const order of orders) {
    for (const shipment of order.shipments ?? []) {
      if (shipment?.deliveryCarrier !== PRODUCT_DELIVERY_CARRIER_LOBO) continue;
      if (shipment.shippingExternalId) continue;

      const items = (order.items ?? []).filter(
        (item) =>
          resolveItemSellerId(item) === String(shipment.sellerId) &&
          !TERMINAL.has(item.status),
      );
      // Передаём только собранные: раньше курьеру ехать не за чем.
      if (buildOrderStatusFromItems(items) !== ORDER_STATUS_READY_TO_SHIP) continue;

      const result = await handOverShipmentToLobo({
        orderId: String(order._id),
        sellerId: String(shipment.sellerId),
      });
      if (result?.ok && !result.alreadySent) retried += 1;
    }
  }

  return { retried };
}

/** Один вызов для крона: сначала догоняем непереданные, потом статусы. */
export async function processLoboCronTasks() {
  const handovers = await retryPendingLoboHandovers();
  const statuses = await syncLoboShipmentStatuses();
  if (handovers.retried > 0 || statuses.moved > 0 || statuses.failed > 0) {
    logServerEvent("info", {
      event: "lobo_cron_done",
      ...handovers,
      ...statuses,
    });
  }
  return { ...handovers, ...statuses };
}
