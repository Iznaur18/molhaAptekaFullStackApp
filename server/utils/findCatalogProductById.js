import mongoose from 'mongoose';

import { ProductModel } from '../models/index.js';
import { attachProductSellerSnapshots } from './attachProductSellerSnapshots.js';
import { enrichProductApiFields } from './productDiscount.js';
import {
    soldQuantityAddFieldsStage,
    soldQuantityLookupStage,
} from './productCatalogQuery.js';

const sellerLookupStages = () => [
    {
        $lookup: {
            from: 'users',
            localField: 'productSeller',
            foreignField: '_id',
            as: 'productSellerArr',
        },
    },
    {
        $addFields: {
            productSeller: { $arrayElemAt: ['$productSellerArr', 0] },
        },
    },
    {
        $project: {
            productSellerArr: 0,
            salesStats: 0,
        },
    },
];

/**
 * @param {string} productId
 */
export const findCatalogProductById = async (productId) => {
    if (!mongoose.isValidObjectId(productId)) {
        return null;
    }

    const rows = await ProductModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(productId) } },
        soldQuantityLookupStage(),
        soldQuantityAddFieldsStage(),
        ...sellerLookupStages(),
    ]);

    const row = rows[0];
    if (!row) {
        return null;
    }

    const [withSellerSnapshots] = await attachProductSellerSnapshots([row]);
    return enrichProductApiFields(withSellerSnapshots);
};
