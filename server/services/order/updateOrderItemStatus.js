import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_RETURNED,
  ORDER_STATUS_SHIPPED,
} from "../../constants/orderConstants.js";
import {
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
} from "../../constants/installmentConstants.js";
import { AppError } from "../../errors/AppError.js";
import { notifyBuyerAboutOrderItemStatus } from "./notifyBuyerAboutOrderItemStatus.js";
import { notifySellerAboutOrderItemReturn } from "./notifySellerAboutOrderItemReturn.js";
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

  await notifyBuyerAboutOrderItemStatus({
    buyerUserId: order.userBuyerId?._id ?? order.userBuyerId,
    actorUserId: sellerId,
    status: ORDER_STATUS_DELIVERED,
    productName: targetItem.productNameAtOrder,
    orderId,
  });

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

  await notifyBuyerAboutOrderItemStatus({
    buyerUserId: buyerId,
    actorUserId: requestUserId,
    status: ORDER_STATUS_CANCELLED,
    productName: targetItem.productNameAtOrder,
    orderId,
  });

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

  await notifyBuyerAboutOrderItemStatus({
    buyerUserId: order.userBuyerId?._id ?? order.userBuyerId,
    actorUserId: sellerId,
    status: ORDER_STATUS_SHIPPED,
    productName: targetItem.productNameAtOrder,
    orderId,
  });

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

/**
 * Возврат: товар уехал к покупателю и вернулся.
 *
 * Закрывает дыру, из-за которой отказ у двери или неудачное вручение было
 * нечем оформить: `cancelled` разрешён только из «В обработке», и позиция
 * навсегда застревала в `shipped` / `delivered` — с ней зависал и резерв
 * остатка, и возможность покупателя подтвердить получение.
 *
 * Разрешён только из `shipped` и `delivered`, то есть пока покупатель не
 * подтвердил получение. После `confirmed` деньги уже прошли: начислены баллы
 * и партнёрская выплата — это возврат с компенсацией, отдельная история.
 *
 * Оформить может любая сторона: покупатель отказывается у двери, продавец
 * принимает товар назад. Кто именно — пишем в `returnedBy`: для продавца это
 * разные ситуации (товар ещё едет обратно или уже на полке).
 *
 * @param {{
 *   orderId: string;
 *   itemIndex: number;
 *   requestUserId: string;
 * }} input
 */
export async function markOrderItemReturned({
  orderId,
  itemIndex,
  requestUserId,
}) {
  const preview = await loadOrderWithItems(orderId);
  const previewItem = getPopulatedOrderItemOrThrow(preview, itemIndex);

  const buyerId = normalizeId(preview.userBuyerId?._id ?? preview.userBuyerId);
  const itemSellerId = normalizeId(
    previewItem.productId.productSeller?._id ?? previewItem.productId.productSeller,
  );
  const isBuyer = buyerId === requestUserId;
  const isSeller = itemSellerId === requestUserId;

  if (!isBuyer && !isSeller) {
    throw new AppError(403, "Нет прав на возврат позиции");
  }

  // Повторный клик по кнопке не должен превращаться в ошибку: возврат уже
  // оформлен, эффекты применены — просто отдаём текущее состояние.
  if (previewItem.status === ORDER_STATUS_RETURNED) {
    await populateOrderForResponse(preview);
    return { order: preview };
  }

  if (
    previewItem.status !== ORDER_STATUS_SHIPPED &&
    previewItem.status !== ORDER_STATUS_DELIVERED
  ) {
    throw new AppError(
      409,
      'Возврат оформляется только из статусов "Отправлен" или "Доставлен"',
    );
  }

  await runInTransaction(async (session) => {
    // Перечитываем внутри транзакции: на ретрае после WriteConflict мутации
    // документа, загруженного снаружи, теряются молча.
    const txnOrder = await loadOrderWithItems(orderId, session);
    const txnItem = getPopulatedOrderItemOrThrow(txnOrder, itemIndex);

    if (txnItem.status === ORDER_STATUS_RETURNED) {
      return;
    }
    if (
      txnItem.status !== ORDER_STATUS_SHIPPED &&
      txnItem.status !== ORDER_STATUS_DELIVERED
    ) {
      throw new AppError(
        409,
        'Возврат оформляется только из статусов "Отправлен" или "Доставлен"',
      );
    }

    const previousStatus = txnItem.status;
    const releaseLine = {
      ...(txnItem.toObject?.() ?? txnItem),
      productId: txnItem.productId,
    };
    const productId = resolveProductIdFromItem(txnItem.productId);

    txnItem.status = ORDER_STATUS_RETURNED;
    txnItem.returnedAt = new Date();
    txnItem.returnedBy = requestUserId;
    markOrderLineLoyaltyReserveReleased(txnItem);

    txnOrder.status = buildOrderStatusFromItems(txnOrder.items);
    if (
      txnOrder.status === ORDER_STATUS_RETURNED ||
      txnOrder.status === ORDER_STATUS_CANCELLED
    ) {
      clearBuyerPassportShareOnOrder(txnOrder);
    }
    await txnOrder.save({ session });

    // Из `delivered` позиция считалась проданной — снимаем её из soldQuantity.
    // Из `shipped` дельта нулевая, функция это учитывает сама.
    await applySoldQuantityDeltaForItemStatusChange({
      productId,
      previousStatus,
      nextStatus: ORDER_STATUS_RETURNED,
      quantity: txnItem.quantity,
      session,
    });

    await releaseUnawardedLoyaltyReservesForOrder([releaseLine], session);

    const freeUnits = Math.floor(Number(txnItem.buyNFreeUnitsAtOrder) || 0);
    if (freeUnits > 0 && productId) {
      await releaseBuyNFreeRedemptionClaim({
        buyerId,
        productId,
        orderId,
        session,
      });
    }
  });

  const updatedOrder = await reloadOrderWithItems(orderId);

  // Узнаёт та сторона, которая возврат не оформляла.
  await notifyBuyerAboutOrderItemStatus({
    buyerUserId: buyerId,
    actorUserId: requestUserId,
    status: ORDER_STATUS_RETURNED,
    productName: previewItem.productNameAtOrder,
    orderId,
  });
  await notifySellerAboutOrderItemReturn({
    sellerUserId: itemSellerId,
    actorUserId: requestUserId,
    buyerUserId: buyerId,
    productName: previewItem.productNameAtOrder,
    orderId,
  });

  return { order: updatedOrder };
}
