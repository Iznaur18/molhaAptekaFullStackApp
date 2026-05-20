import mongoose from 'mongoose';

import { PRODUCT_MODERATION_APPROVED } from '../../constants/productModerationConstants.js';
import { CartModel, OrderModel, ProductModel, UserModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

import {
    ORDER_BUYER_PUBLIC_FIELDS,
    ORDER_ITEMS_POPULATE,
} from './orderQueries.js';
import { buildOrderStatusFromItems } from './orderStatus.js';

const calculateTotalAmount = (items, priceById) =>
    items.reduce((sum, item) => {
        const price = priceById[String(item.productId)];
        return sum + (price ?? 0) * item.quantity;
    }, 0);

const buildItemsWithPriceSnapshot = (items, priceById) =>
    items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceAtOrder: priceById[String(item.productId)],
    }));

const fetchAvailableProductPrices = async (productIds) => {
    const products = await ProductModel.find({
        _id: { $in: productIds },
        productModerationStatus: PRODUCT_MODERATION_APPROVED,
        productIsAvailable: { $ne: false },
    })
        .select('_id productPrice')
        .lean();

    return Object.fromEntries(
        products.map((p) => [String(p._id), p.productPrice]),
    );
};

const appendOrderToBuyList = async (userId, orderId) => {
    const user = await UserModel.findById(userId);
    if (!user) return false;

    const safeBuyList = Array.isArray(user.buyList)
        ? user.buyList.filter((id) => mongoose.isValidObjectId(id))
        : [];

    user.buyList = [...safeBuyList, orderId];
    await user.save({ validateBeforeSave: false });
    return true;
};

/** `POST /order` — создание заказа авторизованным пользователем. */
export const makeOrderController = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, paymentMethod } = req.body;
        const verified = req.verifiedDeliveryAddress;

        const uniqueProductIds = [
            ...new Set(items.map((item) => String(item.productId))),
        ];
        const priceById = await fetchAvailableProductPrices(uniqueProductIds);

        if (Object.keys(priceById).length !== uniqueProductIds.length) {
            return errorRes(
                res,
                400,
                'Один или несколько товаров не найдены или недоступны',
            );
        }

        const itemsWithPrice = buildItemsWithPriceSnapshot(items, priceById);
        const totalAmount = calculateTotalAmount(itemsWithPrice, priceById);
        const status = buildOrderStatusFromItems(itemsWithPrice);

        const order = await OrderModel.create({
            userBuyerId: userId,
            items: itemsWithPrice,
            totalAmount,
            deliveryAddress: verified.displayAddress,
            deliveryAddressFlat: verified.flat,
            deliveryAddressFiasId: verified.fiasId,
            paymentMethod,
            status,
        });

        const isUserUpdated = await appendOrderToBuyList(userId, order._id);
        if (!isUserUpdated) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        await order.populate('userBuyerId', ORDER_BUYER_PUBLIC_FIELDS);
        await order.populate(ORDER_ITEMS_POPULATE);

        await CartModel.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(String(userId)) },
            { $set: { items: {} } },
            { upsert: true },
        );

        return successRes(res, { message: 'Заказ успешно создан', order });
    } catch (error) {
        console.error('makeOrderController error:', error);
        return errorRes(res, 500, 'Ошибка при создании заказа');
    }
};
