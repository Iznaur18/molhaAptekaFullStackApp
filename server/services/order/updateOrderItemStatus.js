import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "../../constants/orderConstants.js";
import {
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
} from "../../constants/installmentConstants.js";
import { AppError } from "../../errors/AppError.js";
import { InstallmentContractModel, UserModel } from "../../models/index.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import { cancelLinkedOrderForInstallmentContract } from "./cancelLinkedOrderForInstallmentContract.js";
import { prepareLoyaltyPointsForConfirmedOrderItem } from "./loyaltyPoints.js";
import {
  markOrderLineLoyaltyReserveReleased,
  releaseUnawardedLoyaltyReservesForOrder,
} from "./orderLoyaltyPoints.js";
import { settleLoyaltyPointsReservation } from "../loyalty/loyaltyPointsReserve.js";
import { isPremiumActive } from "../user/premiumAccess.js";
import { finalizeOffersAfterOrderConfirmed } from "../product/productPriceOfferHelpers.js";
import { closeProductAuction } from "../product/productAuction.js";
import { syncRaffleProgressForProductSale } from "../raffle/raffleHelpers.js";
import { applySoldQuantityDeltaForItemStatusChange } from "../product/productSoldQuantityDenorm.js";
import {
  decrementProductStockOnItemConfirmed,
  syncProductCatalogAfterStockChange,
} from "../product/productStock.js";
import { buildOrderStatusFromItems } from "./orderStatus.js";

import {
  assertSellerOwnsOrderItem,
  getPopulatedOrderItemOrThrow,
  loadOrderWithItems,
  normalizeId,
  populateOrderForResponse,
  reloadOrderWithItems,
  resolveProductIdFromItem,
} from "./orderItemStatusHelpers.js";

const runConfirmItemSideEffects = async (order, targetItem, productId) => {
  if (!productId) return;

  try {
    await syncProductCatalogAfterStockChange(productId);
  } catch (stockSyncError) {
    console.error("syncProductCatalogAfterStockChange error:", stockSyncError);
  }

  try {
    await syncRaffleProgressForProductSale(productId);
  } catch (raffleSyncError) {
    console.error("syncRaffleProgressForProductSale error:", raffleSyncError);
  }

  try {
    if (order.priceOfferId) {
      await finalizeOffersAfterOrderConfirmed(productId, order.priceOfferId);
      return;
    }

    const productDoc = typeof targetItem.productId === "object" ? targetItem.productId : null;
    if (productDoc?.productAuctionEnabled === true) {
      await closeProductAuction(productId, { markCompletedOnce: true });
    }
  } catch (finalizeError) {
    console.error("finalizeOffersAfterOrderConfirmed error:", finalizeError);
  }
};

/**
 * @param {{
 *   orderId: string;
 *   itemIndex: number;
 *   sellerId: string;
 *   userId: string;
 * }} input
 */
export async function markOrderItemDeliveredBySeller({
  orderId,
  itemIndex,
  sellerId,
  userId,
}) {
  const order = await loadOrderWithItems(orderId);
  const targetItem = getPopulatedOrderItemOrThrow(order, itemIndex);
  assertSellerOwnsOrderItem(targetItem, sellerId);

  if (targetItem.status !== ORDER_STATUS_SHIPPED) {
    throw new AppError(
      409,
      'Позицию можно отметить доставленной только из статуса "Отправлен"',
    );
  }

  const previousStatus = targetItem.status;
  targetItem.status = ORDER_STATUS_DELIVERED;
  targetItem.deliveredAt = new Date();
  targetItem.deliveredBy = userId;

  await applySoldQuantityDeltaForItemStatusChange({
    productId: resolveProductIdFromItem(targetItem.productId),
    previousStatus,
    nextStatus: ORDER_STATUS_DELIVERED,
    quantity: targetItem.quantity,
  });

  order.status = buildOrderStatusFromItems(order.items);
  await order.save();
  await populateOrderForResponse(order);

  return { order };
}

/**
 * @param {{
 *   orderId: string;
 *   itemIndex: number;
 *   requestUserId: string;
 *   userId: string;
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
  const order = await loadOrderWithItems(orderId);
  const targetItem = getPopulatedOrderItemOrThrow(order, itemIndex);

  const buyerId = normalizeId(order.userBuyerId?._id ?? order.userBuyerId);
  const itemSellerId = normalizeId(
    targetItem.productId.productSeller?._id ?? targetItem.productId.productSeller,
  );
  const isBuyer = buyerId === requestUserId;
  const isSeller = itemSellerId === requestUserId;

  if (!isBuyer && !isSeller) {
    throw new AppError(403, "Нет прав на отмену позиции");
  }

  if (targetItem.status !== ORDER_STATUS_PENDING) {
    throw new AppError(
      409,
      'Позицию можно отменить только из статуса "В обработке"',
    );
  }

  if (isBuyer && order.installmentContractId) {
    const cancellationReason =
      String(reason ?? "Отменено покупателем").trim() || "Отменено покупателем";

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
  } else {
    const releaseLine = {
      ...(targetItem.toObject?.() ?? targetItem),
      productId: targetItem.productId,
    };

    await runInTransaction(async (session) => {
      targetItem.status = ORDER_STATUS_CANCELLED;
      markOrderLineLoyaltyReserveReleased(targetItem);
      order.status = buildOrderStatusFromItems(order.items);
      await order.save({ session });
      await releaseUnawardedLoyaltyReservesForOrder([releaseLine], session);
    });
  }

  const updatedOrder = await reloadOrderWithItems(orderId);
  return { order: updatedOrder };
}

/**
 * @param {{
 *   orderId: string;
 *   itemIndex: number;
 *   sellerId: string;
 * }} input
 */
export async function markOrderItemShippedBySeller({ orderId, itemIndex, sellerId }) {
  const order = await loadOrderWithItems(orderId);
  const targetItem = getPopulatedOrderItemOrThrow(order, itemIndex);
  assertSellerOwnsOrderItem(targetItem, sellerId);

  if (targetItem.status !== ORDER_STATUS_PENDING) {
    throw new AppError(
      409,
      'Позицию можно отметить отправленной только из статуса "В обработке"',
    );
  }

  targetItem.status = ORDER_STATUS_SHIPPED;
  order.status = buildOrderStatusFromItems(order.items);
  await order.save();
  await populateOrderForResponse(order);

  return { order };
}

/**
 * @param {{
 *   orderId: string;
 *   itemIndex: number;
 *   buyerId: string;
 *   userId: string;
 * }} input
 */
export async function confirmOrderItemByBuyer({ orderId, itemIndex, buyerId, userId }) {
  const order = await loadOrderWithItems(orderId);

  if (normalizeId(order.userBuyerId) !== buyerId) {
    throw new AppError(403, "Подтверждать доставку может только покупатель");
  }

  const targetItem = getPopulatedOrderItemOrThrow(order, itemIndex);

  if (targetItem.status !== ORDER_STATUS_DELIVERED) {
    throw new AppError(
      409,
      'Подтверждение доступно только для статуса "Доставлен"',
    );
  }

  if (targetItem.loyaltyPointsAwarded) {
    return {
      order: await populateOrderForResponse(order),
      pointsEarned: Number(targetItem.loyaltyPointsEarned) || 0,
    };
  }

  const buyer = await UserModel.findById(buyerId)
    .select("isPremiumUser premiumExpiresAt")
    .lean();
  const isPremiumUser = isPremiumActive(buyer);

  const itemSellerId = normalizeId(
    targetItem.productId?.productSeller?._id ?? targetItem.productId?.productSeller,
  );
  const reservedTotal = Math.ceil(Number(targetItem.loyaltyPointsReservedTotal) || 0);
  const productId = resolveProductIdFromItem(targetItem.productId);

  let pointsEarned = 0;

  try {
    pointsEarned = await runInTransaction(async (session) => {
      const earned = prepareLoyaltyPointsForConfirmedOrderItem({
        order,
        itemIndex,
        isPremiumUser,
      });

      if (earned > 0) {
        if (!itemSellerId) {
          throw new AppError(400, "Продавец позиции не найден");
        }
        await settleLoyaltyPointsReservation({
          sellerId: itemSellerId,
          buyerId,
          amount: earned,
          session,
        });
        markOrderLineLoyaltyReserveReleased(targetItem);
      } else if (
        reservedTotal > 0 &&
        !targetItem.loyaltyPointsReserveReleased &&
        itemSellerId
      ) {
        await releaseUnawardedLoyaltyReservesForOrder(
          [
            {
              ...(targetItem.toObject?.() ?? targetItem),
              productId: targetItem.productId,
            },
          ],
          session,
        );
        markOrderLineLoyaltyReserveReleased(targetItem);
      }

      targetItem.status = ORDER_STATUS_CONFIRMED;
      targetItem.confirmedAt = new Date();
      targetItem.confirmedBy = userId;
      order.status = buildOrderStatusFromItems(order.items);
      await order.save({ session });

      if (productId) {
        await decrementProductStockOnItemConfirmed(productId, targetItem.quantity, session);
      }

      return earned;
    });
  } catch (txError) {
    if (txError instanceof AppError) {
      throw txError;
    }
    console.error("confirmOrderItemByBuyer transaction error:", txError);
    throw new AppError(
      409,
      "Не удалось начислить баллы: у продавца недостаточно замороженных баллов",
    );
  }

  await runConfirmItemSideEffects(order, targetItem, productId);
  await populateOrderForResponse(order);

  return { order, pointsEarned };
}
