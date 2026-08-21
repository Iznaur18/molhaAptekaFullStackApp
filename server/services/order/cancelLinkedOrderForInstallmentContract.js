import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_PENDING,
} from "../../constants/orderConstants.js";
import { OrderModel } from "../../models/index.js";
import { applySoldQuantityDeltaForItemStatusChange } from "../product/productSoldQuantityDenorm.js";
import { clearBuyerPassportShareOnOrder } from "./buyerPassportShare.js";
import { ORDER_ITEMS_POPULATE } from "./orderQueries.js";
import {
  buildOrderStatusFromItems,
  normalizeOrderDocumentForRuntime,
  normalizeOrderItemsForRuntime,
} from "./orderStatus.js";
import {
  markOrderLineLoyaltyReserveReleased,
  releaseUnawardedLoyaltyReservesForOrder,
} from "./orderLoyaltyPoints.js";
import {
  releaseBuyNFreeRedemptionClaim,
  rollbackBuyNFreeProgressOnCancel,
} from "../product/productBuyNFreeProgress.js";
import { normalizeId, resolveProductIdFromItem } from "./orderItemStatusHelpers.js";

/**
 * Отменяет связанный заказ рассрочки и снимает не начисленный резерв баллов продавца.
 *
 * @param {import('mongoose').Types.ObjectId | string | null | undefined} orderId
 * @param {import('mongoose').ClientSession | null} session
 */
export const cancelLinkedOrderForInstallmentContract = async (
  orderId,
  session = null,
) => {
  if (!orderId) {
    return null;
  }

  const query = OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
  const order = session ? await query.session(session) : await query;
  if (!order) {
    return null;
  }

  normalizeOrderDocumentForRuntime(order);
  normalizeOrderItemsForRuntime(order.items);

  const buyerId = normalizeId(order.userBuyerId?._id ?? order.userBuyerId);
  const releaseLines = [];
  for (const item of order.items) {
    if (item.status === ORDER_STATUS_CANCELLED) {
      continue;
    }
    const previousStatus = item.status;
    if (!item.loyaltyPointsAwarded && !item.loyaltyPointsReserveReleased) {
      releaseLines.push({
        ...(item.toObject?.() ?? item),
        productId: item.productId,
      });
      markOrderLineLoyaltyReserveReleased(item);
    }
    if (item.productId != null) {
      await applySoldQuantityDeltaForItemStatusChange({
        productId: item.productId,
        previousStatus,
        nextStatus: ORDER_STATUS_CANCELLED,
        quantity: item.quantity,
        session,
      });
    }
    const productId = resolveProductIdFromItem(item.productId);
    const freeUnits = Math.floor(Number(item.buyNFreeUnitsAtOrder) || 0);
    if (previousStatus === ORDER_STATUS_PENDING && freeUnits > 0 && buyerId && productId) {
      await releaseBuyNFreeRedemptionClaim({
        buyerId,
        productId,
        orderId: order._id,
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
    item.status = ORDER_STATUS_CANCELLED;
  }

  order.status = buildOrderStatusFromItems(order.items);
  clearBuyerPassportShareOnOrder(order);
  await order.save(session ? { session } : undefined);

  if (releaseLines.length > 0) {
    await releaseUnawardedLoyaltyReservesForOrder(releaseLines, session);
  }

  return order;
};
