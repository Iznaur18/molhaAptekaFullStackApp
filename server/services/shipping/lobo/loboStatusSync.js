import { PRODUCT_DELIVERY_CARRIER_LOBO } from "@molha/api-contract";

import {
  LOBO_STATUS_CANCELLED,
  LOBO_STATUS_DONE,
  LOBO_STATUS_IN_PROGRESS,
  LOBO_STATUS_MERGED,
  LOBO_TRACKABLE_STATUSES,
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

import { getLoboOrder, getLoboTracking, isLoboConfigured } from "./loboClient.js";
import { resolveLoboCarrierOrderId } from "./loboShipmentOrders.js";

const TERMINAL = new Set(ORDER_TERMINAL_STATUSES);

/** Статусы службы, после которых опрашивать больше нечего. */
const FINAL_CARRIER_STATUSES = new Set([LOBO_STATUS_DONE, LOBO_STATUS_CANCELLED]);

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
 * Промежуточные статусы (`new`, `merged`, `assigned`, `accepted`, `arrived`) не меняют
 * в лестнице: товар всё ещё у продавца, и покупателю сообщать нечего.
 *
 * @param {string} carrierStatus
 * @returns {string | null}
 */
export function resolveLadderStatusForCarrier(carrierStatus) {
  if (carrierStatus === LOBO_STATUS_IN_PROGRESS) return ORDER_STATUS_IN_DELIVERY;
  if (carrierStatus === LOBO_STATUS_DONE) return "delivered";
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
        carrierOrderId: String(shipment.shippingCarrierOrderId ?? ""),
        carrierStatus: String(shipment.shippingCarrierStatus ?? ""),
        trackingUrl: String(shipment.shippingTrackingUrl ?? ""),
        courierName: String(shipment.shippingCourier?.name ?? ""),
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
    // Опрос идёт раз в несколько минут, и курьер успевает забрать и довезти
    // между двумя проходами. Тогда позиции всё ещё «Готов к отгрузке», а
    // штатный сервис принимает только то, что уже в пути: сначала догоняем
    // пропущенную ступень, иначе отправление зависает навсегда.
    await applyLadderStatus({
      orderId,
      sellerId,
      ladderStatus: ORDER_STATUS_IN_DELIVERY,
    });

    const { markOrderItemDeliveredBySeller } =
      await import("../../order/updateOrderItemStatus.js");
    const order = await OrderModel.findById(orderId).select("items").lean();
    // Номер позиции берём по месту в массиве: поле itemIndex проставляет
    // нормализация при чтении через сервисы, а в сыром документе его нет.
    const indexes = (order?.items ?? [])
      .map((item, index) => ({ item, index }))
      .filter(
        ({ item }) =>
          resolveItemSellerId(item) === String(sellerId) && !TERMINAL.has(item.status),
      )
      .map(({ index }) => index);

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
 * Ссылка отслеживания для покупателя, когда курьер уже на заказе. Без неё
 * заказ всё равно едет, поэтому ошибка только в лог.
 *
 * @param {{ id: string | null; status: string } | null} remote
 */
async function fetchTrackingUrl(remote) {
  if (!remote?.id || !LOBO_TRACKABLE_STATUSES.includes(remote.status)) return "";
  try {
    return (await getLoboTracking(remote.id)).url;
  } catch (error) {
    logServerEvent("error", {
      event: "lobo_tracking_failed",
      carrierOrderId: remote.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return "";
  }
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
      const carrierOrderId = await resolveLoboCarrierOrderId({
        shippingCarrierOrderId: row.carrierOrderId,
        shippingExternalId: row.externalId,
      });
      if (!carrierOrderId) continue;
      let remote = await getLoboOrder(carrierOrderId);
      // Склеенный заказ сам больше не движется: едет тот, в который его влили.
      if (remote?.status === LOBO_STATUS_MERGED && remote.mergedInto) {
        remote = await getLoboOrder(remote.mergedInto);
      }
      const carrierStatus = String(remote?.status ?? "");
      const trackingUrl = row.trackingUrl || (await fetchTrackingUrl(remote));
      if (!carrierStatus) continue;
      const courier = remote?.courierName
        ? {
            name: remote.courierName,
            vehicleMake: remote.courierCarBrand,
            vehicleColor: remote.courierCarColor,
            vehiclePlate: remote.courierCarNumber,
          }
        : null;
      if (
        carrierStatus === row.carrierStatus &&
        trackingUrl === row.trackingUrl &&
        (courier?.name ?? "") === row.courierName
      ) {
        continue;
      }

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
            "shipments.$.shippingCarrierOrderId": carrierOrderId,
            "shipments.$.shippingTrackingUrl": trackingUrl,
            "shipments.$.shippingCourier": courier,
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

/** Раскладку статуса проверяем напрямую: воспроизводить гонку опроса
 * таймерами — тест, который врёт через раз. */
export const __applyForTest = applyLadderStatus;

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
