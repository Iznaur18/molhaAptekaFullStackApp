import {
  ORDER_PRE_SHIPMENT_STATUSES,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
} from "../../constants/orderConstants.js";
import {
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
} from "../../constants/installmentConstants.js";
import { ESCROW_REFUND_REASON_ITEM_CANCELLED } from "../../constants/escrowConstants.js";
import { AppError } from "../../errors/AppError.js";
import { InstallmentContractModel } from "../../models/index.js";
import { markEscrowLineRefundable } from "../payments/escrowLedger.js";
import { releaseBuyNFreeRedemptionClaim } from "../product/productBuyNFreeProgress.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

import { cancelLinkedOrderForInstallmentContract } from "./cancelLinkedOrderForInstallmentContract.js";
import { clearBuyerPassportShareOnOrder } from "./buyerPassportShare.js";
import { notifyBuyerAboutOrderCancelled } from "./notifyBuyerAboutOrderItemStatus.js";
import {
  markOrderLineLoyaltyReserveReleased,
  releaseUnawardedLoyaltyReservesForOrder,
} from "./orderLoyaltyPoints.js";
import {
  getOrderItemOrThrow,
  loadOrderWithItems,
  normalizeId,
  reloadOrderWithItems,
  resolveOrderItemSellerId,
  resolveProductIdFromItem,
} from "./orderItemStatusHelpers.js";
import { buildOrderStatusFromItems } from "./orderStatus.js";

/** Товар ещё у продавца — отсюда отмена ничего не стоит. */
const PRE_SHIPMENT = new Set(ORDER_PRE_SHIPMENT_STATUSES);

const TOO_LATE_MESSAGE = "Отменить можно, только пока товар у продавца";

/** @param {import('mongoose').Document} order */
const resolveBuyerId = (order) =>
  normalizeId(order.userBuyerId?._id ?? order.userBuyerId);

/**
 * Что именно отменяем: индекс, продавец строки и название для уведомления.
 *
 * @param {{ order: any; itemIndex: number; requestUserId: string; buyerId: string }} input
 */
const resolveCancelTarget = ({ order, itemIndex, requestUserId, buyerId }) => {
  const item = getOrderItemOrThrow(order, itemIndex);
  const sellerId = resolveOrderItemSellerId(item);

  if (buyerId !== requestUserId && sellerId !== requestUserId) {
    throw new AppError(403, "Нет прав на отмену позиции");
  }
  if (item.status !== ORDER_STATUS_CANCELLED && !PRE_SHIPMENT.has(item.status)) {
    throw new AppError(409, TOO_LATE_MESSAGE);
  }

  return { itemIndex, sellerId, productName: item.productNameAtOrder ?? "" };
};

/**
 * Рассрочка: отмена любой стороной гасит и заказ, и контракт — иначе в списках
 * рассрочки остаётся «призрак» в статусе pending/active.
 *
 * @param {{ order: any; userId: unknown; reason?: string; isBuyer: boolean }} input
 */
const cancelInstallmentOrder = async ({ order, userId, reason, isBuyer }) => {
  const defaultReason = isBuyer ? "Отменено покупателем" : "Отменено продавцом";
  const cancellationReason = String(reason ?? defaultReason).trim() || defaultReason;

  await runInTransaction(async (session) => {
    const contract = await InstallmentContractModel.findById(
      order.installmentContractId,
    ).session(session);
    if (!contract) {
      throw new AppError(404, "Контракт рассрочки не найден");
    }
    if (contract.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED) {
      throw new AppError(409, "Контракт рассрочки уже закрыт");
    }
    if (contract.status !== INSTALLMENT_CONTRACT_STATUS_CANCELLED) {
      contract.status = INSTALLMENT_CONTRACT_STATUS_CANCELLED;
      contract.cancelledAt = new Date();
      contract.cancelledByUserId = userId;
      contract.cancellationReason = cancellationReason;
      await contract.save({ session });
    }
    await cancelLinkedOrderForInstallmentContract(order._id, session);
  });
};

/**
 * @param {{ releaseLines: any[]; buyerId: string; orderId: string; session: any }} input
 */
const releaseBuyNFreeClaims = async ({ releaseLines, buyerId, orderId, session }) => {
  for (const line of releaseLines) {
    const freeUnits = Math.floor(Number(line.buyNFreeUnitsAtOrder) || 0);
    const productId = resolveProductIdFromItem(line.productId);
    if (freeUnits > 0 && productId) {
      await releaseBuyNFreeRedemptionClaim({ buyerId, productId, orderId, session });
    }
  }
};

/**
 * Гасит позиции внутри транзакции.
 *
 * Заказ перечитываем здесь, а не снаружи: `withTransaction` повторяет колбэк
 * при WriteConflict, а mongoose после откатившегося `save()` считает документ
 * чистым — повторные присваивания в него не пишутся, и позиция молча
 * оставалась «pending» при успешном ответе.
 *
 * @param {{ orderId: string; itemIndexes: number[]; buyerId: string; session: any }} input
 * @returns {Promise<number>} сколько позиций реально погасили
 */
const applyCancelInTransaction = async ({ orderId, itemIndexes, buyerId, session }) => {
  const txnOrder = await loadOrderWithItems(orderId, session);
  const releaseLines = [];

  for (const itemIndex of itemIndexes) {
    const item = getOrderItemOrThrow(txnOrder, itemIndex);
    if (item.status === ORDER_STATUS_CANCELLED) continue;
    if (!PRE_SHIPMENT.has(item.status)) {
      throw new AppError(409, TOO_LATE_MESSAGE);
    }
    releaseLines.push({
      ...(item.toObject?.() ?? item),
      productId: item.productId,
    });
    item.status = ORDER_STATUS_CANCELLED;
    markOrderLineLoyaltyReserveReleased(item);
  }

  if (releaseLines.length === 0) return 0;

  txnOrder.status = buildOrderStatusFromItems(txnOrder.items);
  if (txnOrder.status === ORDER_STATUS_CANCELLED) {
    clearBuyerPassportShareOnOrder(txnOrder);
  }
  await txnOrder.save({ session });
  await releaseUnawardedLoyaltyReservesForOrder(releaseLines, session);
  await releaseBuyNFreeClaims({ releaseLines, buyerId, orderId, session });

  return releaseLines.length;
};

/**
 * Снимает заказ у внешней службы, если в отправлении не осталось живых позиций.
 *
 * Отменённая позиция — ещё не отменённое отправление: в нём могут быть другие
 * товары того же продавца, и курьер по-прежнему нужен.
 *
 * @param {{ order: any; sellerId: string }} input
 */
const cancelExternalShipmentIfNeeded = async ({ order, sellerId }) => {
  const shipment = (order?.shipments ?? []).find(
    (row) => row?.sellerId != null && String(row.sellerId) === String(sellerId),
  );
  if (!shipment?.shippingExternalId) return;

  const stillAlive = (order.items ?? []).some(
    (item) =>
      resolveOrderItemSellerId(item) === String(sellerId) &&
      item?.status !== ORDER_STATUS_CANCELLED &&
      item?.status !== ORDER_STATUS_RETURNED,
  );
  if (stillAlive) return;

  try {
    const { cancelShipmentInLobo } =
      await import("../shipping/lobo/loboShipmentOrders.js");
    await cancelShipmentInLobo({
      orderId: String(order._id),
      sellerId: String(sellerId),
    });
  } catch (error) {
    // Отмену у нас это не отменяет: у службы заказ снимет крон или человек.
    logServerEvent("error", {
      event: "external_shipment_cancel_failed",
      orderId: String(order?._id ?? ""),
      sellerId: String(sellerId),
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Предоплаченный заказ: деньги за отменённую позицию уже у площадки, и теперь
 * это долг перед покупателем. Без пометки строка уехала бы продавцу вместе с
 * остальными.
 *
 * @param {{ order: any; targets: any[]; orderId: string }} input
 */
const runCancelSideEffects = async ({ order, targets, orderId }) => {
  for (const target of targets) {
    await markEscrowLineRefundable({
      orderId,
      sellerId: target.sellerId,
      itemIndex: target.itemIndex,
      reason: ESCROW_REFUND_REASON_ITEM_CANCELLED,
    });
  }

  for (const sellerId of new Set(targets.map((target) => target.sellerId))) {
    await cancelExternalShipmentIfNeeded({ order, sellerId });
  }
};

/**
 * Отменяет перечисленные позиции заказа одной транзакцией.
 *
 * @param {{
 *   orderId: string;
 *   itemIndexes: number[];
 *   requestUserId: string;
 *   userId: unknown;
 *   reason?: string;
 * }} input
 */
export async function cancelOrderItems({
  orderId,
  itemIndexes,
  requestUserId,
  userId,
  reason,
}) {
  const order = await loadOrderWithItems(orderId);
  const buyerId = resolveBuyerId(order);
  const targets = itemIndexes.map((itemIndex) =>
    resolveCancelTarget({ order, itemIndex, requestUserId, buyerId }),
  );

  let cancelledCount = targets.length;
  if (order.installmentContractId) {
    await cancelInstallmentOrder({
      order,
      userId,
      reason,
      isBuyer: buyerId === requestUserId,
    });
  } else {
    cancelledCount = await runInTransaction((session) =>
      applyCancelInTransaction({ orderId, itemIndexes, buyerId, session }),
    );
  }

  const updatedOrder = await reloadOrderWithItems(orderId);
  await runCancelSideEffects({ order: updatedOrder, targets, orderId });

  // Повторный клик по кнопке — не новость: гасить было уже нечего.
  if (cancelledCount > 0) {
    await notifyBuyerAboutOrderCancelled({
      buyerUserId: buyerId,
      actorUserId: requestUserId,
      productName: targets.length === 1 ? targets[0].productName : "",
      wholeOrder: targets.length > 1,
      orderId,
    });
  }

  return { order: updatedOrder };
}

/**
 * @param {{
 *   orderId: string;
 *   itemIndex: number;
 *   requestUserId: string;
 *   userId: unknown;
 *   reason?: string;
 * }} input
 */
export async function markOrderItemCancelled({
  orderId,
  itemIndex,
  requestUserId,
  userId,
  reason,
}) {
  return cancelOrderItems({
    orderId,
    itemIndexes: [itemIndex],
    requestUserId,
    userId,
    reason,
  });
}

/**
 * Позиции отправления, которые ещё можно снять.
 *
 * Отправление, а не весь документ заказа: и покупатель, и продавец видят
 * заказ карточкой одного продавца, и кнопка на ней должна гасить ровно то,
 * что в этой карточке лежит.
 *
 * @param {{ order: any; sellerId: string }} input
 * @returns {number[]}
 */
const resolveCancellableItemIndexes = ({ order, sellerId }) => {
  const shipmentItems = (order.items ?? [])
    .map((item, itemIndex) => ({ item, itemIndex }))
    .filter(({ item }) => resolveOrderItemSellerId(item) === sellerId);

  if (shipmentItems.length === 0) {
    throw new AppError(404, "Отправление не найдено");
  }

  const alive = shipmentItems.filter(
    ({ item }) => item.status !== ORDER_STATUS_CANCELLED,
  );
  if (alive.length === 0) {
    throw new AppError(409, "Заказ уже отменён");
  }
  if (alive.some(({ item }) => !PRE_SHIPMENT.has(item.status))) {
    throw new AppError(409, TOO_LATE_MESSAGE);
  }

  return alive.map(({ itemIndex }) => itemIndex);
};

/**
 * Отмена заказа целиком — одна кнопка вместо клика по каждой позиции.
 *
 * @param {{
 *   orderId: string;
 *   sellerId: string;
 *   requestUserId: string;
 *   userId: unknown;
 *   reason?: string;
 * }} input
 */
export async function cancelOrderShipment({
  orderId,
  sellerId,
  requestUserId,
  userId,
  reason,
}) {
  const order = await loadOrderWithItems(orderId);

  if (resolveBuyerId(order) !== requestUserId && sellerId !== requestUserId) {
    throw new AppError(403, "Нет прав на отмену заказа");
  }

  const itemIndexes = resolveCancellableItemIndexes({ order, sellerId });

  return cancelOrderItems({ orderId, itemIndexes, requestUserId, userId, reason });
}
