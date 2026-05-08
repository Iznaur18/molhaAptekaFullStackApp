import { OrderModel } from '../../models/index.js';
import {
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_PENDING,
    ORDER_STATUS_SHIPPED,
} from '../../constants/orderConstants.js';
import { errorRes, successRes } from '../../utils/index.js';

import {
    ORDER_BUYER_PUBLIC_FIELDS,
    ORDER_ITEMS_POPULATE,
} from './orderQueries.js';
import {
    buildOrderStatusFromItems,
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

        order.status = buildOrderStatusFromItems(order.items);
        await order.save();
        await populateOrderForResponse(order);

        return successRes(res, { order });
    } catch (error) {
        console.error('confirmOrderItemByBuyerController error:', error);
        return errorRes(res, 500, 'Ошибка при подтверждении позиции');
    }
};
