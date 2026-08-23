import { OrderModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";

import { ORDER_BUYER_PUBLIC_FIELDS, ORDER_ITEMS_POPULATE } from "./orderQueries.js";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
} from "../../constants/orderConstants.js";
import { syncRaffleProgressForProductSale } from "../../services/raffle/raffleHelpers.js";
import { applySoldQuantityDeltaForItemStatusChange } from "../../services/product/productSoldQuantityDenorm.js";
import {
  decrementProductStockOnItemConfirmed,
  restoreProductStockOnItemCancelled,
} from "../../services/product/productStock.js";
import {
  markOrderLineLoyaltyReserveReleased,
  releaseUnawardedLoyaltyReservesForOrder,
} from "../../services/order/orderLoyaltyPoints.js";
import { clearBuyerPassportShareOnOrder } from "../../services/order/buyerPassportShare.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  normalizeOrderDocumentForRuntime,
  normalizeOrderItemsForRuntime,
} from "../../services/order/orderStatus.js";
import {
  releaseBuyNFreeRedemptionClaim,
  rollbackBuyNFreeProgressOnCancel,
} from "../../services/product/productBuyNFreeProgress.js";
import { normalizeId } from "../../services/order/orderItemStatusHelpers.js";

/** `PATCH /order/:orderId/status` — смена статуса заказа (только админ). */
export const updateOrderStatusController = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await OrderModel.findById(orderId);
  if (!order) {
    return errorRes(res, 404, "Заказ не найден");
  }
  normalizeOrderDocumentForRuntime(order);
  normalizeOrderItemsForRuntime(order.items);

  const now = new Date();
  /** @type {{ productId: import('mongoose').Types.ObjectId; quantity: number }[]} */
  const itemsPendingConfirmStock = [];

  for (const item of order.items) {
    const previousStatus = item.status;
    const productId = item.productId;
    if (productId == null) {
      continue;
    }
    if (
      status === ORDER_STATUS_CANCELLED &&
      previousStatus !== ORDER_STATUS_CANCELLED
    ) {
      try {
        await restoreProductStockOnItemCancelled(
          productId,
          item.quantity,
          previousStatus,
        );
      } catch (stockError) {
        logServerEvent("error", {
          event: "restoreproductstockonitemcancelled",
          error: stockError instanceof Error ? stockError.message : String(stockError),
        });
      }
      if (previousStatus === ORDER_STATUS_CONFIRMED) {
        try {
          await syncRaffleProgressForProductSale(productId);
        } catch (raffleSyncError) {
          logServerEvent("error", {
            event: "syncraffleprogressforproductsale",
            error:
              raffleSyncError instanceof Error
                ? raffleSyncError.message
                : String(raffleSyncError),
          });
        }
      }
    } else if (
      status === ORDER_STATUS_CONFIRMED &&
      previousStatus !== ORDER_STATUS_CONFIRMED
    ) {
      itemsPendingConfirmStock.push({
        productId,
        quantity: item.quantity,
      });
    }
  }

  if (status === ORDER_STATUS_CANCELLED) {
    await runInTransaction(async (session) => {
      // Заказ читаем внутри транзакции: withTransaction повторяет колбэк при
      // WriteConflict, а mongoose после первого (откатившегося) save() считает
      // документ чистым — на ретрае мутации документа, загруженного снаружи,
      // молча не сохранялись, и заказ оставался в прежнем статусе.
      const txnOrder = await OrderModel.findById(orderId).session(session);
      if (!txnOrder) {
        throw new Error("ORDER_NOT_FOUND");
      }
      normalizeOrderDocumentForRuntime(txnOrder);
      normalizeOrderItemsForRuntime(txnOrder.items);

      const buyerId = normalizeId(txnOrder.userBuyerId?._id ?? txnOrder.userBuyerId);

      for (const item of txnOrder.items) {
        if (item.status !== ORDER_STATUS_CANCELLED) {
          markOrderLineLoyaltyReserveReleased(item);
        }
      }

      for (const item of txnOrder.items) {
        if (item.status === ORDER_STATUS_CANCELLED || item.productId == null) {
          continue;
        }
        const previousStatus = item.status;
        await applySoldQuantityDeltaForItemStatusChange({
          productId: item.productId,
          previousStatus,
          nextStatus: ORDER_STATUS_CANCELLED,
          quantity: item.quantity,
          session,
        });

        const productId = normalizeId(item.productId?._id ?? item.productId);
        const freeUnits = Math.floor(Number(item.buyNFreeUnitsAtOrder) || 0);
        if (
          previousStatus === ORDER_STATUS_PENDING &&
          freeUnits > 0 &&
          buyerId &&
          productId
        ) {
          await releaseBuyNFreeRedemptionClaim({
            buyerId,
            productId,
            orderId: txnOrder._id,
            session,
          });
        }
        if (
          previousStatus === ORDER_STATUS_CONFIRMED &&
          item.buyNFreeProgressApplied === true &&
          buyerId &&
          productId
        ) {
          await rollbackBuyNFreeProgressOnCancel({
            buyerId,
            productId,
            action: item.buyNFreeProgressAction,
            countBefore: item.buyNFreeProgressCountBefore,
            session,
          });
          item.buyNFreeProgressApplied = false;
        }
      }

      txnOrder.items.forEach((item) => {
        item.status = status;
        item.deliveredAt = null;
        item.deliveredBy = null;
        item.confirmedAt = null;
        item.confirmedBy = null;
      });
      txnOrder.status = status;
      clearBuyerPassportShareOnOrder(txnOrder);
      await txnOrder.save({ session });

      await txnOrder.populate(ORDER_ITEMS_POPULATE);
      await releaseUnawardedLoyaltyReservesForOrder(txnOrder.items, session);
    });
  } else {
    for (const item of order.items) {
      if (item.productId == null || item.status === status) {
        continue;
      }
      try {
        await applySoldQuantityDeltaForItemStatusChange({
          productId: item.productId,
          previousStatus: item.status,
          nextStatus: status,
          quantity: item.quantity,
        });
      } catch (soldQuantityError) {
        logServerEvent("error", {
          event: "applysoldquantitydeltaforitemstatuschange",
          error:
            soldQuantityError instanceof Error
              ? soldQuantityError.message
              : String(soldQuantityError),
        });
      }
    }

    order.items.forEach((item) => {
      item.status = status;
      if (status !== ORDER_STATUS_DELIVERED) {
        item.deliveredAt = null;
        item.deliveredBy = null;
      } else {
        item.deliveredAt = item.deliveredAt ?? now;
      }
      if (status !== ORDER_STATUS_CONFIRMED) {
        item.confirmedAt = null;
        item.confirmedBy = null;
      } else {
        item.confirmedAt = item.confirmedAt ?? now;
      }
    });
    order.status = status;
    await order.save();
  }

  for (const { productId, quantity } of itemsPendingConfirmStock) {
    try {
      await syncRaffleProgressForProductSale(productId);
    } catch (raffleSyncError) {
      logServerEvent("error", {
        event: "syncraffleprogressforproductsale",
        error:
          raffleSyncError instanceof Error
            ? raffleSyncError.message
            : String(raffleSyncError),
      });
    }
    try {
      await decrementProductStockOnItemConfirmed(productId, quantity);
    } catch (stockError) {
      logServerEvent("error", {
        event: "decrementproductstockonitemconfirmed",
        error: stockError instanceof Error ? stockError.message : String(stockError),
      });
    }
  }

  // Ветка отмены пишет через собственный документ внутри транзакции, поэтому
  // ответ собираем из перечитанного заказа, а не из устаревшего в памяти.
  const responseOrder = (await OrderModel.findById(orderId)) ?? order;
  await responseOrder.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
  await responseOrder.populate(ORDER_ITEMS_POPULATE);

  return successRes(res, { order: responseOrder });
};
