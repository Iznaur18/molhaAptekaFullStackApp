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
import { InstallmentContractModel, OrderModel, UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../utils/index.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import { cancelLinkedOrderForInstallmentContract } from "../../utils/cancelLinkedOrderForInstallmentContract.js";
import { prepareLoyaltyPointsForConfirmedOrderItem } from "../../utils/loyaltyPoints.js";
import {
  markOrderLineLoyaltyReserveReleased,
  releaseUnawardedLoyaltyReservesForOrder,
} from "../../utils/orderLoyaltyPoints.js";
import { settleLoyaltyPointsReservation } from "../../utils/loyaltyPointsReserve.js";
import { isPremiumActive } from "../../utils/premiumAccess.js";
import { finalizeOffersAfterOrderConfirmed } from "../../utils/productPriceOfferHelpers.js";
import { closeProductAuction } from "../../utils/productAuction.js";
import { syncRaffleProgressForProductSale } from "../../utils/raffleHelpers.js";
import { applySoldQuantityDeltaForItemStatusChange } from "../../utils/productSoldQuantityDenorm.js";
import {
  decrementProductStockOnItemConfirmed,
  syncProductCatalogAfterStockChange,
} from "../../utils/productStock.js";

import { ORDER_BUYER_PUBLIC_FIELDS, ORDER_ITEMS_POPULATE } from "./orderQueries.js";
import {
  buildOrderStatusFromItems,
  normalizeOrderDocumentForRuntime,
  normalizeOrderItemsForRuntime,
} from "./orderStatus.js";

const parseItemIndex = (raw) => Number(raw);

const getOrderItemByIndex = (order, itemIndex) =>
  itemIndex >= 0 && itemIndex < order.items.length ? order.items[itemIndex] : null;

const normalizeId = (value) => String(value ?? "");

const populateOrderForResponse = async (order) => {
  await order.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
  await order.populate(ORDER_ITEMS_POPULATE);
  return order;
};

/** `PATCH /order/:orderId/items/:itemIndex/delivered` — продавец помечает позицию как доставленную. */
export const markOrderItemDeliveredBySellerController = async (req, res) => {
  try {
    const { orderId, itemIndex: rawItemIndex } = req.params;
    const sellerId = String(req.userId);
    const itemIndex = parseItemIndex(rawItemIndex);

    const order = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
    if (!order) return errorRes(res, 404, "Заказ не найден");
    normalizeOrderDocumentForRuntime(order);
    normalizeOrderItemsForRuntime(order.items);

    const targetItem = getOrderItemByIndex(order, itemIndex);
    if (!targetItem) return errorRes(res, 404, "Позиция заказа не найдена");

    if (!targetItem.productId || typeof targetItem.productId === "string") {
      return errorRes(res, 400, "Товар позиции не найден");
    }

    const itemSellerId = normalizeId(
      targetItem.productId.productSeller?._id ?? targetItem.productId.productSeller,
    );
    if (itemSellerId !== sellerId) {
      return errorRes(res, 403, "Можно обновлять только свои продажи");
    }

    if (targetItem.status !== ORDER_STATUS_SHIPPED) {
      return errorRes(
        res,
        409,
        'Позицию можно отметить доставленной только из статуса "Отправлен"',
      );
    }

    const previousStatus = targetItem.status;
    targetItem.status = ORDER_STATUS_DELIVERED;
    targetItem.deliveredAt = new Date();
    targetItem.deliveredBy = req.userId;

    await applySoldQuantityDeltaForItemStatusChange({
      productId:
        targetItem.productId?._id ??
        (typeof targetItem.productId === "object"
          ? targetItem.productId._id
          : targetItem.productId),
      previousStatus,
      nextStatus: ORDER_STATUS_DELIVERED,
      quantity: targetItem.quantity,
    });

    order.status = buildOrderStatusFromItems(order.items);
    await order.save();

    await populateOrderForResponse(order);

    return successRes(res, { order });
  } catch (error) {
    console.error("markOrderItemDeliveredBySellerController error:", error);
    return errorRes(res, 500, "Ошибка при обновлении статуса позиции");
  }
};

/** `PATCH /order/:orderId/items/:itemIndex/cancelled` — покупатель или продавец отменяет позицию в обработке. */
export const markOrderItemCancelledController = async (req, res) => {
  try {
    const { orderId, itemIndex: rawItemIndex } = req.params;
    const requestUserId = String(req.userId);
    const itemIndex = parseItemIndex(rawItemIndex);

    const order = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
    if (!order) return errorRes(res, 404, "Заказ не найден");
    normalizeOrderDocumentForRuntime(order);
    normalizeOrderItemsForRuntime(order.items);

    const targetItem = getOrderItemByIndex(order, itemIndex);
    if (!targetItem) return errorRes(res, 404, "Позиция заказа не найдена");

    if (!targetItem.productId || typeof targetItem.productId === "string") {
      return errorRes(res, 400, "Товар позиции не найден");
    }

    const buyerId = normalizeId(order.userBuyerId?._id ?? order.userBuyerId);
    const itemSellerId = normalizeId(
      targetItem.productId.productSeller?._id ?? targetItem.productId.productSeller,
    );
    const isBuyer = buyerId === requestUserId;
    const isSeller = itemSellerId === requestUserId;

    if (!isBuyer && !isSeller) {
      return errorRes(res, 403, "Нет прав на отмену позиции");
    }

    if (targetItem.status !== ORDER_STATUS_PENDING) {
      return errorRes(
        res,
        409,
        'Позицию можно отменить только из статуса "В обработке"',
      );
    }

    if (isBuyer && order.installmentContractId) {
      const cancellationReason =
        String(req.body?.reason ?? "Отменено покупателем").trim() ||
        "Отменено покупателем";

      await runInTransaction(async (session) => {
        const contract = await InstallmentContractModel.findById(
          order.installmentContractId,
        ).session(session);
        if (!contract) {
          throw new Error("INSTALLMENT_CONTRACT_NOT_FOUND");
        }
        if (contract.status === INSTALLMENT_CONTRACT_STATUS_COMPLETED) {
          throw new Error("INSTALLMENT_CONTRACT_COMPLETED");
        }
        if (contract.status !== INSTALLMENT_CONTRACT_STATUS_CANCELLED) {
          contract.status = INSTALLMENT_CONTRACT_STATUS_CANCELLED;
          contract.cancelledAt = new Date();
          contract.cancelledByUserId = req.userId;
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

    const updatedOrder = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
    if (!updatedOrder) return errorRes(res, 404, "Заказ не найден");
    normalizeOrderDocumentForRuntime(updatedOrder);
    normalizeOrderItemsForRuntime(updatedOrder.items);
    await populateOrderForResponse(updatedOrder);

    return successRes(res, { order: updatedOrder });
  } catch (error) {
    if (error instanceof Error && error.message === "INSTALLMENT_CONTRACT_NOT_FOUND") {
      return errorRes(res, 404, "Контракт рассрочки не найден");
    }
    if (error instanceof Error && error.message === "INSTALLMENT_CONTRACT_COMPLETED") {
      return errorRes(res, 409, "Контракт рассрочки уже закрыт");
    }
    console.error("markOrderItemCancelledController error:", error);
    return errorRes(res, 500, "Ошибка при отмене позиции");
  }
};

export const markOrderItemCancelledBySellerController = markOrderItemCancelledController;

/** `PATCH /order/:orderId/items/:itemIndex/shipped` — продавец помечает позицию как отправленную. */
export const markOrderItemShippedBySellerController = async (req, res) => {
  try {
    const { orderId, itemIndex: rawItemIndex } = req.params;
    const sellerId = String(req.userId);
    const itemIndex = parseItemIndex(rawItemIndex);

    const order = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
    if (!order) return errorRes(res, 404, "Заказ не найден");
    normalizeOrderDocumentForRuntime(order);
    normalizeOrderItemsForRuntime(order.items);

    const targetItem = getOrderItemByIndex(order, itemIndex);
    if (!targetItem) return errorRes(res, 404, "Позиция заказа не найдена");

    if (!targetItem.productId || typeof targetItem.productId === "string") {
      return errorRes(res, 400, "Товар позиции не найден");
    }

    const itemSellerId = normalizeId(
      targetItem.productId.productSeller?._id ?? targetItem.productId.productSeller,
    );
    if (itemSellerId !== sellerId) {
      return errorRes(res, 403, "Можно обновлять только свои продажи");
    }

    if (targetItem.status !== ORDER_STATUS_PENDING) {
      return errorRes(
        res,
        409,
        'Позицию можно отметить отправленной только из статуса "В обработке"',
      );
    }

    targetItem.status = ORDER_STATUS_SHIPPED;
    order.status = buildOrderStatusFromItems(order.items);
    await order.save();
    await populateOrderForResponse(order);

    return successRes(res, { order });
  } catch (error) {
    console.error("markOrderItemShippedBySellerController error:", error);
    return errorRes(res, 500, "Ошибка при обновлении статуса позиции");
  }
};

/** `PATCH /order/:orderId/items/:itemIndex/confirm` — покупатель подтверждает доставленную позицию. */
export const confirmOrderItemByBuyerController = async (req, res) => {
  try {
    const { orderId, itemIndex: rawItemIndex } = req.params;
    const buyerId = String(req.userId);
    const itemIndex = parseItemIndex(rawItemIndex);

    const order = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
    if (!order) return errorRes(res, 404, "Заказ не найден");
    normalizeOrderDocumentForRuntime(order);
    normalizeOrderItemsForRuntime(order.items);

    if (normalizeId(order.userBuyerId) !== buyerId) {
      return errorRes(res, 403, "Подтверждать доставку может только покупатель");
    }

    const targetItem = getOrderItemByIndex(order, itemIndex);
    if (!targetItem) return errorRes(res, 404, "Позиция заказа не найдена");

    if (targetItem.status !== ORDER_STATUS_DELIVERED) {
      return errorRes(
        res,
        409,
        'Подтверждение доступно только для статуса "Доставлен"',
      );
    }

    if (targetItem.loyaltyPointsAwarded) {
      return successRes(res, {
        order: await populateOrderForResponse(order),
        pointsEarned: Number(targetItem.loyaltyPointsEarned) || 0,
      });
    }

    const buyer = await UserModel.findById(buyerId)
      .select("isPremiumUser premiumExpiresAt")
      .lean();
    const isPremiumUser = isPremiumActive(buyer);

    const itemSellerId = normalizeId(
      targetItem.productId?.productSeller?._id ?? targetItem.productId?.productSeller,
    );
    const reservedTotal = Math.ceil(Number(targetItem.loyaltyPointsReservedTotal) || 0);

    let pointsEarned = 0;

    const productId = targetItem.productId
      ? typeof targetItem.productId === "object"
        ? targetItem.productId._id
        : targetItem.productId
      : null;

    try {
      pointsEarned = await runInTransaction(async (session) => {
        const earned = prepareLoyaltyPointsForConfirmedOrderItem({
          order,
          itemIndex,
          isPremiumUser,
        });

        if (earned > 0) {
          if (!itemSellerId) {
            throw new Error("ITEM_SELLER_NOT_FOUND");
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
        targetItem.confirmedBy = req.userId;
        order.status = buildOrderStatusFromItems(order.items);
        await order.save({ session });

        if (productId) {
          await decrementProductStockOnItemConfirmed(
            productId,
            targetItem.quantity,
            session,
          );
        }

        return earned;
      });
    } catch (txError) {
      if (txError instanceof Error && txError.message === "ITEM_SELLER_NOT_FOUND") {
        return errorRes(res, 400, "Продавец позиции не найден");
      }
      console.error("confirmOrderItemByBuyer transaction error:", txError);
      return errorRes(
        res,
        409,
        "Не удалось начислить баллы: у продавца недостаточно замороженных баллов",
      );
    }

    if (productId) {
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
        } else {
          const productDoc =
            typeof targetItem.productId === "object" ? targetItem.productId : null;
          if (productDoc?.productAuctionEnabled === true) {
            await closeProductAuction(productId, {
              markCompletedOnce: true,
            });
          }
        }
      } catch (finalizeError) {
        console.error("finalizeOffersAfterOrderConfirmed error:", finalizeError);
      }
    }

    await populateOrderForResponse(order);

    return successRes(res, { order, pointsEarned });
  } catch (error) {
    console.error("confirmOrderItemByBuyerController error:", error);
    return errorRes(res, 500, "Ошибка при подтверждении позиции");
  }
};
