import {
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_PENDING,
    ORDER_STATUS_SHIPPED,
} from '../../constants/orderConstants.js';
import { OrderModel, UserModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';
import { prepareLoyaltyPointsForConfirmedOrderItem } from '../../utils/loyaltyPoints.js';
import { finalizeOffersAfterOrderConfirmed } from '../../utils/productPriceOfferHelpers.js';
import { closeProductAuction } from '../../utils/productAuction.js';
import { syncRaffleProgressForProductSale } from '../../utils/raffleHelpers.js';
import { decrementProductStockOnItemConfirmed } from '../../utils/productStock.js';

import {
    ORDER_BUYER_PUBLIC_FIELDS,
    ORDER_ITEMS_POPULATE,
} from './orderQueries.js';
import {
    buildOrderStatusFromItems,
    normalizeOrderDocumentForRuntime,
    normalizeOrderItemsForRuntime,
} from './orderStatus.js';

const parseItemIndex = (raw) => Number(raw);

const getOrderItemByIndex = (order, itemIndex) =>
    itemIndex >= 0 && itemIndex < order.items.length ? order.items[itemIndex] : null;

const normalizeId = (value) => String(value ?? '');

const populateOrderForResponse = async (order) => {
    await order.populate('userBuyerId', ORDER_BUYER_PUBLIC_FIELDS);
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
        if (!order) return errorRes(res, 404, 'Заказ не найден');
        normalizeOrderDocumentForRuntime(order);
        normalizeOrderItemsForRuntime(order.items);

        const targetItem = getOrderItemByIndex(order, itemIndex);
        if (!targetItem) return errorRes(res, 404, 'Позиция заказа не найдена');

        if (!targetItem.productId || typeof targetItem.productId === 'string') {
            return errorRes(res, 400, 'Товар позиции не найден');
        }

        const itemSellerId = normalizeId(
            targetItem.productId.productSeller?._id ?? targetItem.productId.productSeller,
        );
        if (itemSellerId !== sellerId) {
            return errorRes(res, 403, 'Можно обновлять только свои продажи');
        }

        if (targetItem.status !== ORDER_STATUS_SHIPPED) {
            return errorRes(res, 409, 'Позицию можно отметить доставленной только из статуса "Отправлен"');
        }

        targetItem.status = ORDER_STATUS_DELIVERED;
        targetItem.deliveredAt = new Date();
        targetItem.deliveredBy = req.userId;

        order.status = buildOrderStatusFromItems(order.items);
        await order.save();

        await populateOrderForResponse(order);

        return successRes(res, { order });
    } catch (error) {
        console.error('markOrderItemDeliveredBySellerController error:', error);
        return errorRes(res, 500, 'Ошибка при обновлении статуса позиции');
    }
};

/** `PATCH /order/:orderId/items/:itemIndex/shipped` — продавец помечает позицию как отправленную. */
export const markOrderItemShippedBySellerController = async (req, res) => {
    try {
        const { orderId, itemIndex: rawItemIndex } = req.params;
        const sellerId = String(req.userId);
        const itemIndex = parseItemIndex(rawItemIndex);

        const order = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
        if (!order) return errorRes(res, 404, 'Заказ не найден');
        normalizeOrderDocumentForRuntime(order);
        normalizeOrderItemsForRuntime(order.items);

        const targetItem = getOrderItemByIndex(order, itemIndex);
        if (!targetItem) return errorRes(res, 404, 'Позиция заказа не найдена');

        if (!targetItem.productId || typeof targetItem.productId === 'string') {
            return errorRes(res, 400, 'Товар позиции не найден');
        }

        const itemSellerId = normalizeId(
            targetItem.productId.productSeller?._id ?? targetItem.productId.productSeller,
        );
        if (itemSellerId !== sellerId) {
            return errorRes(res, 403, 'Можно обновлять только свои продажи');
        }

        if (targetItem.status !== ORDER_STATUS_PENDING) {
            return errorRes(res, 409, 'Позицию можно отметить отправленной только из статуса "В обработке"');
        }

        targetItem.status = ORDER_STATUS_SHIPPED;
        order.status = buildOrderStatusFromItems(order.items);
        await order.save();
        await populateOrderForResponse(order);

        return successRes(res, { order });
    } catch (error) {
        console.error('markOrderItemShippedBySellerController error:', error);
        return errorRes(res, 500, 'Ошибка при обновлении статуса позиции');
    }
};

/** `PATCH /order/:orderId/items/:itemIndex/confirm` — покупатель подтверждает доставленную позицию. */
export const confirmOrderItemByBuyerController = async (req, res) => {
    try {
        const { orderId, itemIndex: rawItemIndex } = req.params;
        const buyerId = String(req.userId);
        const itemIndex = parseItemIndex(rawItemIndex);

        const order = await OrderModel.findById(orderId).populate(ORDER_ITEMS_POPULATE);
        if (!order) return errorRes(res, 404, 'Заказ не найден');
        normalizeOrderDocumentForRuntime(order);
        normalizeOrderItemsForRuntime(order.items);

        if (normalizeId(order.userBuyerId) !== buyerId) {
            return errorRes(res, 403, 'Подтверждать доставку может только покупатель');
        }

        const targetItem = getOrderItemByIndex(order, itemIndex);
        if (!targetItem) return errorRes(res, 404, 'Позиция заказа не найдена');

        if (targetItem.status !== ORDER_STATUS_DELIVERED) {
            return errorRes(res, 409, 'Подтверждение доступно только для статуса "Доставлен"');
        }

        targetItem.status = ORDER_STATUS_CONFIRMED;
        targetItem.confirmedAt = new Date();
        targetItem.confirmedBy = req.userId;

        const buyer = await UserModel.findById(buyerId)
            .select('isPremiumUser')
            .lean();
        const pointsEarned = prepareLoyaltyPointsForConfirmedOrderItem({
            order,
            itemIndex,
            isPremiumUser: Boolean(buyer?.isPremiumUser),
        });

        order.status = buildOrderStatusFromItems(order.items);
        await order.save();

        if (targetItem.productId) {
            const productId =
                typeof targetItem.productId === 'object'
                    ? targetItem.productId._id
                    : targetItem.productId;
            try {
                await decrementProductStockOnItemConfirmed(
                    productId,
                    targetItem.quantity,
                );
            } catch (stockError) {
                console.error('decrementProductStockOnItemConfirmed error:', stockError);
            }
            try {
                if (order.priceOfferId) {
                    await finalizeOffersAfterOrderConfirmed(
                        productId,
                        order.priceOfferId,
                    );
                } else {
                    const productDoc =
                        typeof targetItem.productId === 'object'
                            ? targetItem.productId
                            : null;
                    if (productDoc?.productAuctionEnabled === true) {
                        await closeProductAuction(productId, {
                            markCompletedOnce: true,
                        });
                    }
                }
            } catch (finalizeError) {
                console.error(
                    'finalizeOffersAfterOrderConfirmed error:',
                    finalizeError,
                );
            }
            try {
                await syncRaffleProgressForProductSale(productId);
            } catch (raffleSyncError) {
                console.error('syncRaffleProgressForProductSale error:', raffleSyncError);
            }
        }

        if (pointsEarned > 0) {
            await UserModel.updateOne(
                { _id: buyerId },
                { $inc: { userLoyaltyPoints: pointsEarned } },
            );
        }

        await populateOrderForResponse(order);

        return successRes(res, { order, pointsEarned });
    } catch (error) {
        console.error('confirmOrderItemByBuyerController error:', error);
        return errorRes(res, 500, 'Ошибка при подтверждении позиции');
    }
};
