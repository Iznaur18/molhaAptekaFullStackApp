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
import { settleAffiliatePayoutForOrderItem } from "../affiliate/settleAffiliatePayoutForOrderItem.js";
import { notifyAffiliatePayoutCredited } from "../affiliate/notifyAffiliatePayoutCredited.js";
import { finalizeOffersAfterOrderConfirmed } from "../product/productPriceOfferHelpers.js";
import { closeProductAuction } from "../product/productAuction.js";
import { syncRaffleProgressForProductSale } from "../raffle/raffleHelpers.js";
import { applySoldQuantityDeltaForItemStatusChange } from "../product/productSoldQuantityDenorm.js";
import {
  decrementProductStockOnItemConfirmed,
  syncProductCatalogAfterStockChange,
} from "../product/productStock.js";
import {
  applyBuyNFreeProgressOnConfirm,
  releaseBuyNFreeRedemptionClaim,
  rollbackBuyNFreeProgressOnCancel,
} from "../product/productBuyNFreeProgress.js";
import { buildOrderStatusFromItems } from "./orderStatus.js";

import { clearBuyerPassportShareOnOrder } from "./buyerPassportShare.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  assertSellerOwnsOrderItem,
  getOrderItemByIndex,
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
    logServerEvent("error", {
      event: "syncproductcatalogafterstockchange",
      error:
        stockSyncError instanceof Error
          ? stockSyncError.message
          : String(stockSyncError),
    });
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

  try {
    if (order.priceOfferId) {
      await finalizeOffersAfterOrderConfirmed(productId, order.priceOfferId);
      return;
    }

    const productDoc =
      typeof targetItem.productId === "object" ? targetItem.productId : null;
    if (productDoc?.productAuctionEnabled === true) {
      await closeProductAuction(productId, { markCompletedOnce: true });
    }
  } catch (finalizeError) {
    logServerEvent("error", {
      event: "finalizeoffersafterorderconfirmed",
      error:
        finalizeError instanceof Error ? finalizeError.message : String(finalizeError),
    });
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
    analytics: {
      orderId,
      itemIndex,
      buyerUserId: normalizeId(order.userBuyerId),
      sellerUserId: sellerId,
      unitPriceAtOrder: targetItem.unitPriceAtOrder,
    },
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
    throw new AppError(409, 'Позицию можно отменить только из статуса "В обработке"');
  }

  // Рассрочный заказ: отмена buyer ИЛИ seller должна гасить и Order, и InstallmentContract.
  // Раньше seller-cancel через Order оставлял контракт pending/active → «призраки» в списках рассрочки.
  if (order.installmentContractId) {
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
  } else {
    await runInTransaction(async (session) => {
      // Перечитываем внутри транзакции — см. loadOrderWithItems: на ретрае
      // после WriteConflict мутации документа, загруженного снаружи, молча
      // теряются, и позиция оставалась "pending" при успешном ответе.
      const txnOrder = await loadOrderWithItems(orderId, session);
      const txnItem = getPopulatedOrderItemOrThrow(txnOrder, itemIndex);

      if (txnItem.status === ORDER_STATUS_CANCELLED) {
        return;
      }
      if (txnItem.status !== ORDER_STATUS_PENDING) {
        throw new AppError(
          409,
          'Позицию можно отменить только из статуса "В обработке"',
        );
      }

      const releaseLine = {
        ...(txnItem.toObject?.() ?? txnItem),
        productId: txnItem.productId,
      };
      const productIdForRelease = resolveProductIdFromItem(txnItem.productId);

      txnItem.status = ORDER_STATUS_CANCELLED;
      markOrderLineLoyaltyReserveReleased(txnItem);
      txnOrder.status = buildOrderStatusFromItems(txnOrder.items);
      if (txnOrder.status === ORDER_STATUS_CANCELLED) {
        clearBuyerPassportShareOnOrder(txnOrder);
      }
      await txnOrder.save({ session });
      await releaseUnawardedLoyaltyReservesForOrder([releaseLine], session);
      const freeUnits = Math.floor(Number(txnItem.buyNFreeUnitsAtOrder) || 0);
      if (freeUnits > 0 && productIdForRelease) {
        await releaseBuyNFreeRedemptionClaim({
          buyerId,
          productId: productIdForRelease,
          orderId,
          session,
        });
      }
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
  const preview = await loadOrderWithItems(orderId);

  if (normalizeId(preview.userBuyerId) !== buyerId) {
    throw new AppError(403, "Подтверждать доставку может только покупатель");
  }

  const previewItem = getPopulatedOrderItemOrThrow(preview, itemIndex);

  if (previewItem.status !== ORDER_STATUS_DELIVERED) {
    throw new AppError(409, 'Подтверждение доступно только для статуса "Доставлен"');
  }

  if (previewItem.loyaltyPointsAwarded) {
    return {
      order: await populateOrderForResponse(preview),
      pointsEarned: Number(previewItem.loyaltyPointsEarned) || 0,
    };
  }

  const buyer = await UserModel.findById(buyerId)
    .select("isUserDataConfirmed isBlockedUser")
    .lean();
  const isUserDataConfirmed = buyer?.isUserDataConfirmed === true;

  let pointsEarned = 0;
  /** @type {{ paid: number; referrerUserId?: string; deferNotification?: boolean } | null} */
  let affiliatePayout = null;
  /** @type {unknown} */
  let productId = null;

  try {
    const txnResult = await runInTransaction(async (session) => {
      // Документ и всё производное от него читаем ВНУТРИ транзакции: при
      // WriteConflict `withTransaction` повторяет этот колбэк, а mongoose
      // после первого (откатившегося) `save()` считает документ чистым —
      // на ретрае повторные присваивания тех же значений не помечаются
      // dirty и `save()` не пишет ничего. Позиция молча оставалась
      // "delivered", баллы и affiliate-выплата не проводились, но наружу
      // уходил успешный ответ.
      const order = await loadOrderWithItems(orderId, session);
      const targetItem = getPopulatedOrderItemOrThrow(order, itemIndex);

      if (targetItem.loyaltyPointsAwarded) {
        return {
          alreadyAwarded: true,
          earned: Number(targetItem.loyaltyPointsEarned) || 0,
          affiliateResult: null,
          productId: resolveProductIdFromItem(targetItem.productId),
        };
      }

      if (targetItem.status !== ORDER_STATUS_DELIVERED) {
        throw new AppError(
          409,
          'Подтверждение доступно только для статуса "Доставлен"',
        );
      }

      const itemSellerId = normalizeId(
        targetItem.productId?.productSeller?._id ?? targetItem.productId?.productSeller,
      );
      const reservedTotal = Math.ceil(
        Number(targetItem.loyaltyPointsReservedTotal) || 0,
      );
      const itemProductId = resolveProductIdFromItem(targetItem.productId);

      const earned = prepareLoyaltyPointsForConfirmedOrderItem({
        order,
        itemIndex,
        isUserDataConfirmed,
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

      const affiliateResult = await settleAffiliatePayoutForOrderItem({
        order,
        targetItem,
        buyerId,
        session,
      });

      if (itemProductId && targetItem.buyNFreeProgressApplied !== true) {
        const progressResult = await applyBuyNFreeProgressOnConfirm({
          buyerId,
          productId: itemProductId,
          quantity: targetItem.quantity,
          freeUnits: targetItem.buyNFreeUnitsAtOrder ?? 0,
          session,
        });
        if (progressResult.applied) {
          targetItem.buyNFreeProgressApplied = true;
          targetItem.buyNFreeProgressAction = progressResult.action;
          targetItem.buyNFreeProgressCountBefore = progressResult.countBefore;
        }
      }

      targetItem.status = ORDER_STATUS_CONFIRMED;
      targetItem.confirmedAt = new Date();
      targetItem.confirmedBy = userId;
      order.status = buildOrderStatusFromItems(order.items);
      await order.save({ session });

      if (itemProductId) {
        await decrementProductStockOnItemConfirmed(
          itemProductId,
          targetItem.quantity,
          session,
        );
      }

      return { earned, affiliateResult, productId: itemProductId };
    });
    pointsEarned = txnResult.earned;
    affiliatePayout = txnResult.affiliateResult;
    productId = txnResult.productId;
  } catch (txError) {
    if (txError instanceof AppError) {
      throw txError;
    }
    logServerEvent("error", {
      event: "confirmorderitembybuyer_transaction",
      error: txError instanceof Error ? txError.message : String(txError),
    });
    throw new AppError(
      409,
      "Не удалось начислить баллы: у продавца недостаточно замороженных баллов",
    );
  }

  if (
    affiliatePayout?.deferNotification &&
    affiliatePayout.referrerUserId &&
    affiliatePayout.paid > 0
  ) {
    await notifyAffiliatePayoutCredited({
      referrerUserId: affiliatePayout.referrerUserId,
      amount: affiliatePayout.paid,
      buyerUserId: buyerId,
      productId: productId ? String(productId) : null,
    });
  }

  // Ответ строим из перечитанного заказа, а не из документа, загруженного до
  // транзакции: раньше клиенту уходило состояние из памяти, которое могло
  // разойтись с БД.
  const updatedOrder = await reloadOrderWithItems(orderId);
  const updatedItem = getOrderItemByIndex(updatedOrder, itemIndex);
  await runConfirmItemSideEffects(updatedOrder, updatedItem ?? {}, productId);

  return { order: updatedOrder, pointsEarned };
}
