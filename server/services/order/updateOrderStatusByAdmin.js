import { OrderModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";

import { ORDER_BUYER_PUBLIC_FIELDS, ORDER_ITEMS_POPULATE } from "./orderQueries.js";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
} from "../../constants/orderConstants.js";
import { syncRaffleProgressForProductSale } from "../raffle/raffleHelpers.js";
import { applySoldQuantityDeltaForItemStatusChange } from "../product/productSoldQuantityDenorm.js";
import {
  decrementProductStockOnItemConfirmed,
  restoreProductStockOnItemCancelled,
} from "../product/productStock.js";
import {
  markOrderLineLoyaltyReserveReleased,
  releaseUnawardedLoyaltyReservesForOrder,
} from "./orderLoyaltyPoints.js";
import { refundPointsPaymentForItems } from "./orderPointsPayment.js";
import { clearBuyerPassportShareOnOrder } from "./buyerPassportShare.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  normalizeOrderDocumentForRuntime,
  normalizeOrderItemsForRuntime,
} from "./orderStatus.js";
import {
  releaseBuyNFreeRedemptionClaim,
  rollbackBuyNFreeProgressOnCancel,
} from "../product/productBuyNFreeProgress.js";
import { normalizeId } from "./orderItemStatusHelpers.js";

const runBestEffortRaffleSync = async (productIds) => {
  for (const productId of productIds) {
    if (!productId) {
      continue;
    }
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
};

/**
 * Админская смена статуса всего заказа (`PATCH /order/:orderId/status`).
 *
 * @param {{ orderId: string, status: string }} args
 */
export async function updateOrderStatusByAdmin({ orderId, status }) {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new AppError(404, "Заказ не найден");
  }
  normalizeOrderDocumentForRuntime(order);
  normalizeOrderItemsForRuntime(order.items);

  const now = new Date();
  /** @type {{ productId: import('mongoose').Types.ObjectId; quantity: number }[]} */
  const itemsPendingConfirmStock = [];
  /** @type {string[]} */
  const confirmedProductIdsBeforeCancel = [];

  for (const item of order.items) {
    const previousStatus = item.status;
    const productId = item.productId;
    if (productId == null) {
      continue;
    }

    if (
      status === ORDER_STATUS_CANCELLED &&
      previousStatus === ORDER_STATUS_CONFIRMED
    ) {
      confirmedProductIdsBeforeCancel.push(String(normalizeId(productId)));
    }

    if (
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
      const txnOrder = await OrderModel.findById(orderId).session(session);
      if (!txnOrder) {
        throw new AppError(404, "Заказ не найден");
      }
      normalizeOrderDocumentForRuntime(txnOrder);
      normalizeOrderItemsForRuntime(txnOrder.items);

      const buyerId = normalizeId(txnOrder.userBuyerId?._id ?? txnOrder.userBuyerId);

      for (const item of txnOrder.items) {
        if (item.status !== ORDER_STATUS_CANCELLED) {
          markOrderLineLoyaltyReserveReleased(item);
        }
      }
      await refundPointsPaymentForItems({
        items: txnOrder.items,
        buyerId,
        session,
      });

      for (const item of txnOrder.items) {
        if (item.status === ORDER_STATUS_CANCELLED || item.productId == null) {
          continue;
        }

        const previousStatus = item.status;
        const productId = normalizeId(item.productId?._id ?? item.productId);

        if (previousStatus !== ORDER_STATUS_CANCELLED) {
          await restoreProductStockOnItemCancelled(
            productId,
            item.quantity,
            previousStatus,
            session,
          );
        }

        await applySoldQuantityDeltaForItemStatusChange({
          productId: item.productId,
          previousStatus,
          nextStatus: ORDER_STATUS_CANCELLED,
          quantity: item.quantity,
          session,
        });

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

    await runBestEffortRaffleSync(confirmedProductIdsBeforeCancel);
  } else {
    for (const item of order.items) {
      if (item.productId == null || item.status === status) {
        continue;
      }

      await applySoldQuantityDeltaForItemStatusChange({
        productId: item.productId,
        previousStatus: item.status,
        nextStatus: status,
        quantity: item.quantity,
        analytics: {
          orderId: String(order._id),
          itemIndex: order.items.indexOf(item),
          buyerUserId: normalizeId(order.userBuyerId?._id ?? order.userBuyerId),
          unitPriceAtOrder: item.unitPriceAtOrder,
        },
      });
    }

    if (status === ORDER_STATUS_CONFIRMED) {
      for (const { productId, quantity } of itemsPendingConfirmStock) {
        await decrementProductStockOnItemConfirmed(productId, quantity);
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

    if (status === ORDER_STATUS_CONFIRMED) {
      await runBestEffortRaffleSync(
        itemsPendingConfirmStock.map(({ productId }) => String(normalizeId(productId))),
      );
    }
  }

  const responseOrder = (await OrderModel.findById(orderId)) ?? order;
  await responseOrder.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
  await responseOrder.populate(ORDER_ITEMS_POPULATE);

  return { order: responseOrder };
}
