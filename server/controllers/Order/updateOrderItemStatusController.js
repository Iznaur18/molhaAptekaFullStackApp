import {
  confirmOrderItemByBuyer,
  markOrderItemCancelled,
  markOrderItemDeliveredBySeller,
  markOrderItemReturned,
  markOrderItemShippedBySeller,
} from "../../services/order/updateOrderItemStatus.js";
import { advanceOrderShipmentStatus } from "../../services/order/advanceShipmentStatus.js";
import { parseItemIndex } from "../../services/order/orderItemStatusHelpers.js";
import {
  sanitizeOrderForBuyerApi,
  sanitizeOrderForSellerApi,
} from "../../services/order/buyerPassportShare.js";
import { successRes } from "../../services/http/index.js";

/**
 * `PATCH /order/:orderId/shipment/status` — продавец двигает своё отправление
 * на ступень: «Принят» → «На сборке» → «Готов».
 *
 * Продавца берём из сессии, а не из пути: чужое отправление тронуть нельзя
 * по построению.
 */
export const advanceMyShipmentStatusController = async (req, res) => {
  const { orderId } = req.params;
  const result = await advanceOrderShipmentStatus({
    orderId,
    sellerId: String(req.userId),
    nextStatus: req.body.nextStatus,
  });

  return successRes(res, {
    fulfillmentMethod: result.fulfillmentMethod,
    movedItemCount: result.movedItemCount,
    order: sanitizeOrderForSellerApi(result.order),
  });
};

/** `PATCH /order/:orderId/items/:itemIndex/delivered` — продавец помечает позицию как доставленную. */
export const markOrderItemDeliveredBySellerController = async (req, res) => {
  const { orderId, itemIndex: rawItemIndex } = req.params;
  const result = await markOrderItemDeliveredBySeller({
    orderId,
    itemIndex: parseItemIndex(rawItemIndex),
    sellerId: String(req.userId),
    userId: req.userId,
  });

  return successRes(res, {
    ...result,
    order: sanitizeOrderForSellerApi(result.order),
  });
};

/** `PATCH /order/:orderId/items/:itemIndex/cancelled` — покупатель или продавец отменяет позицию в обработке. */
export const markOrderItemCancelledController = async (req, res) => {
  const { orderId, itemIndex: rawItemIndex } = req.params;
  const result = await markOrderItemCancelled({
    orderId,
    itemIndex: parseItemIndex(rawItemIndex),
    requestUserId: String(req.userId),
    userId: req.userId,
    reason: req.body?.reason,
  });

  return successRes(res, {
    order: sanitizeOrderForBuyerApi(result.order),
  });
};

export const markOrderItemCancelledBySellerController =
  markOrderItemCancelledController;

/** `PATCH /order/:orderId/items/:itemIndex/shipped` — продавец помечает позицию как отправленную. */
export const markOrderItemShippedBySellerController = async (req, res) => {
  const { orderId, itemIndex: rawItemIndex } = req.params;
  const result = await markOrderItemShippedBySeller({
    orderId,
    itemIndex: parseItemIndex(rawItemIndex),
    sellerId: String(req.userId),
  });

  return successRes(res, {
    ...result,
    order: sanitizeOrderForSellerApi(result.order),
  });
};

/** `PATCH /order/:orderId/items/:itemIndex/returned` — покупатель отказался или продавец принял товар назад. */
export const markOrderItemReturnedController = async (req, res) => {
  const { orderId, itemIndex: rawItemIndex } = req.params;
  const result = await markOrderItemReturned({
    orderId,
    itemIndex: parseItemIndex(rawItemIndex),
    requestUserId: String(req.userId),
  });

  // Ответ уходит и покупателю, и продавцу — прячем паспортные данные,
  // как это делает отмена позиции.
  return successRes(res, {
    ...result,
    order: sanitizeOrderForBuyerApi(result.order),
  });
};

export const markOrderItemReturnedBySellerController =
  markOrderItemReturnedController;

/** `PATCH /order/:orderId/items/:itemIndex/confirm` — покупатель подтверждает доставленную позицию. */
export const confirmOrderItemByBuyerController = async (req, res) => {
  const { orderId, itemIndex: rawItemIndex } = req.params;
  const result = await confirmOrderItemByBuyer({
    orderId,
    itemIndex: parseItemIndex(rawItemIndex),
    buyerId: String(req.userId),
    userId: req.userId,
  });

  return successRes(res, {
    ...result,
    order: sanitizeOrderForBuyerApi(result.order),
  });
};
