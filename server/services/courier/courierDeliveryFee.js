import { ORDER_FULFILLMENT_DELIVERY } from "@molha/api-contract";

import {
  COURIER_DELIVERY_FEE_DECREASE_MESSAGE,
  COURIER_DELIVERY_FEE_FROZEN_MESSAGE,
  COURIER_DELIVERY_FEE_MAX_RUB,
  COURIER_DELIVERY_FEE_MIN_RUB,
  COURIER_DELIVERY_FEE_STEP_RUB,
} from "../../constants/courierConstants.js";
import { AppError } from "../../errors/AppError.js";
import { loadOrderWithItems } from "../order/orderItemStatusHelpers.js";
import { populateOrderForResponse } from "../order/orderItemStatusHelpers.js";
import { resolveItemSellerId } from "../order/orderShipments.js";
import { normalizeId } from "../order/orderItemStatusHelpers.js";

/**
 * Приводит присланную сумму к допустимой или объясняет, почему нельзя.
 *
 * Шаг важен не сам по себе: он держит суммы в одном ряду, чтобы курьер в
 * «Обзоре» сравнивал заказы, а не разбирал копейки.
 *
 * @param {unknown} raw
 * @returns {number}
 */
export function normalizeDeliveryFee(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new AppError(400, "Сумма доставки должна быть целым числом рублей");
  }
  if (value < COURIER_DELIVERY_FEE_MIN_RUB) {
    throw new AppError(
      400,
      `Минимальная подача — ${COURIER_DELIVERY_FEE_MIN_RUB} ₽`,
    );
  }
  if (value > COURIER_DELIVERY_FEE_MAX_RUB) {
    throw new AppError(400, "Сумма доставки слишком велика");
  }
  if ((value - COURIER_DELIVERY_FEE_MIN_RUB) % COURIER_DELIVERY_FEE_STEP_RUB !== 0) {
    throw new AppError(
      400,
      `Сумма меняется шагом ${COURIER_DELIVERY_FEE_STEP_RUB} ₽`,
    );
  }
  return value;
}

/**
 * Сумма доставки на отправление при создании заказа.
 *
 * Самовывозные отправления остаются с нулём: платить курьеру там некому.
 *
 * @param {{
 *   fulfillmentBySellerId: Record<string, string>;
 *   feeBySellerId?: Record<string, unknown> | null;
 * }} input
 * @returns {Record<string, number>}
 */
export function resolveDeliveryFeesBySeller({
  fulfillmentBySellerId,
  feeBySellerId = null,
}) {
  /** @type {Record<string, number>} */
  const fees = {};

  for (const [sellerId, method] of Object.entries(fulfillmentBySellerId ?? {})) {
    if (method !== ORDER_FULFILLMENT_DELIVERY) {
      fees[sellerId] = 0;
      continue;
    }
    const raw = feeBySellerId?.[sellerId];
    fees[sellerId] =
      raw == null ? COURIER_DELIVERY_FEE_MIN_RUB : normalizeDeliveryFee(raw);
  }

  return fees;
}

/**
 * Покупатель поднимает сумму, пока курьер не нашёлся.
 *
 * Понижать нельзя намеренно: иначе можно было бы поднять цену, дождаться
 * курьера и снизить обратно.
 *
 * @param {{ orderId: string; sellerId: string; buyerId: string; feeRub: unknown }} input
 */
export async function raiseShipmentDeliveryFee({
  orderId,
  sellerId,
  buyerId,
  feeRub,
}) {
  const nextFee = normalizeDeliveryFee(feeRub);
  const order = await loadOrderWithItems(orderId);

  if (normalizeId(order.userBuyerId?._id ?? order.userBuyerId) !== String(buyerId)) {
    throw new AppError(403, "Сумму доставки меняет покупатель");
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
  if (shipment.courierId) {
    throw new AppError(409, COURIER_DELIVERY_FEE_FROZEN_MESSAGE);
  }

  const currentFee = Number(shipment.deliveryFeeRub) || 0;
  if (nextFee < currentFee) {
    throw new AppError(409, COURIER_DELIVERY_FEE_DECREASE_MESSAGE);
  }

  shipment.deliveryFeeRub = nextFee;
  await order.save();
  await populateOrderForResponse(order);

  return { order, deliveryFeeRub: nextFee };
}

/** Есть ли в отправлении живые позиции этого продавца. */
export const shipmentHasItems = (order, sellerId) =>
  (order.items ?? []).some(
    (item) => resolveItemSellerId(item) === String(sellerId),
  );
