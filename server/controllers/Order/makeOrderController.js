import mongoose from 'mongoose';

import { PRODUCT_MODERATION_APPROVED } from '../../constants/productModerationConstants.js';
import { CartModel, OrderModel, ProductModel, ProductPriceOfferModel, UserModel } from '../../models/index.js';
import { resolveAcceptedOfferForOrder } from '../../utils/productPriceOfferHelpers.js';
import { assertOrderItemsWithinAvailableStock } from '../../utils/productStock.js';
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

const buildItemsWithPriceSnapshot = (items, productById) =>
    items.map((item) => {
        const snapshot = productById[String(item.productId)];
        return {
            productId: item.productId,
            quantity: item.quantity,
            unitPriceAtOrder: snapshot.price,
            productNameAtOrder: snapshot.name,
        };
    });

/**
 * @param {string[]} productIds
 * @param {import('mongoose').Types.ObjectId | string} buyerUserId
 */
const fetchAvailableProductsForOrder = async (productIds) => {
    const products = await ProductModel.find({
        _id: { $in: productIds },
        productModerationStatus: PRODUCT_MODERATION_APPROVED,
        productIsAvailable: { $ne: false },
        productStockQuantity: { $gt: 0 },
    })
        .select('_id productPrice productName')
        .lean();

    /** @type {Record<string, { price: number; name: string }>} */
    const byId = {};
    for (const product of products) {
        const id = String(product._id);
        const name = String(product.productName ?? '').trim();
        byId[id] = {
            price: product.productPrice,
            name: name.length > 0 ? name : 'Товар без названия',
        };
    }
    return byId;
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
        const { items, paymentMethod, priceOfferId } = req.body;
        const verified = req.verifiedDeliveryAddress;

        const uniqueProductIds = [
            ...new Set(items.map((item) => String(item.productId))),
        ];

        /** @type {Record<string, { price: number; name: string }>} */
        let productById = {};
        let linkedPriceOfferId = null;

        if (priceOfferId) {
            if (items.length !== 1 || items[0].quantity !== 1) {
                return errorRes(
                    res,
                    400,
                    'Заказ по предложению цены — одна позиция, количество 1',
                );
            }

            const productId = String(items[0].productId);

            try {
                await assertOrderItemsWithinAvailableStock(items, userId);
                const resolved = await resolveAcceptedOfferForOrder(
                    priceOfferId,
                    userId,
                    productId,
                );
                productById[productId] = {
                    price: resolved.price,
                    name: resolved.name,
                };
                linkedPriceOfferId = priceOfferId;
            } catch (e) {
                return errorRes(
                    res,
                    400,
                    e instanceof Error
                        ? e.message
                        : 'Нельзя оформить заказ по предложению',
                );
            }
        } else {
            try {
                await assertOrderItemsWithinAvailableStock(items, userId);
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Нельзя оформить заказ';
                return errorRes(res, 400, message);
            }

            productById = await fetchAvailableProductsForOrder(uniqueProductIds);
            if (Object.keys(productById).length !== uniqueProductIds.length) {
                return errorRes(
                    res,
                    400,
                    'Один или несколько товаров не найдены или недоступны',
                );
            }
        }

        const itemsWithPrice = buildItemsWithPriceSnapshot(items, productById);
        const priceById = Object.fromEntries(
            Object.entries(productById).map(([id, row]) => [id, row.price]),
        );
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
            priceOfferId: linkedPriceOfferId,
        });

        if (linkedPriceOfferId) {
            await ProductPriceOfferModel.findByIdAndUpdate(linkedPriceOfferId, {
                $set: { orderId: order._id },
            });
        }

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
