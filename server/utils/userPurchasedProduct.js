import mongoose from 'mongoose';

import { OrderModel } from '../models/index.js';

/**
 * @param {string | null | undefined} buyerUserId
 * @param {string} productId
 */
export const userHasPurchasedProduct = async (buyerUserId, productId) => {
    if (
        !buyerUserId ||
        !mongoose.isValidObjectId(buyerUserId) ||
        !mongoose.isValidObjectId(productId)
    ) {
        return false;
    }

    const order = await OrderModel.findOne({
        userBuyerId: new mongoose.Types.ObjectId(buyerUserId),
        items: {
            $elemMatch: {
                productId: new mongoose.Types.ObjectId(productId),
            },
        },
    })
        .select('_id')
        .lean();

    return order != null;
};
