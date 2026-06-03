import { ORDER_STATUS_CANCELLED } from '../constants/orderConstants.js';
import { ORDER_ITEMS_POPULATE } from '../controllers/Order/orderQueries.js';
import {
    buildOrderStatusFromItems,
    normalizeOrderDocumentForRuntime,
    normalizeOrderItemsForRuntime,
} from '../controllers/Order/orderStatus.js';
import { OrderModel } from '../models/index.js';
import {
    markOrderLineLoyaltyReserveReleased,
    releaseUnawardedLoyaltyReservesForOrder,
} from './orderLoyaltyPoints.js';

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

    const releaseLines = [];
    for (const item of order.items) {
        if (item.status === ORDER_STATUS_CANCELLED) {
            continue;
        }
        if (!item.loyaltyPointsAwarded && !item.loyaltyPointsReserveReleased) {
            releaseLines.push({
                ...(item.toObject?.() ?? item),
                productId: item.productId,
            });
            markOrderLineLoyaltyReserveReleased(item);
        }
        item.status = ORDER_STATUS_CANCELLED;
    }

    order.status = buildOrderStatusFromItems(order.items);
    await order.save(session ? { session } : undefined);

    if (releaseLines.length > 0) {
        await releaseUnawardedLoyaltyReservesForOrder(releaseLines, session);
    }

    return order;
};
