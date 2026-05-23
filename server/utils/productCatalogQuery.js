import {
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DELIVERED,
} from '../constants/orderConstants.js';
import {
    PRODUCT_SORT_NEWEST,
    PRODUCT_SORT_PURCHASES,
    PRODUCT_SORT_VIEWS,
} from '../constants/productCatalogSort.js';
import { ProductModel } from '../models/index.js';
import mongoose from 'mongoose';

import { attachProductSellerSnapshots } from './attachProductSellerSnapshots.js';

const { ObjectId } = mongoose.Types;

/**
 * В aggregate `$match` строковый id не совпадает с ObjectId в БД (в отличие от countDocuments).
 *
 * @param {unknown} value
 */
const toObjectIdIfValid = (value) => {
    if (value == null) {
        return value;
    }
    if (value instanceof ObjectId) {
        return value;
    }
    if (typeof value === 'string' && ObjectId.isValid(value)) {
        return new ObjectId(value);
    }
    return value;
};

/**
 * @param {unknown} fieldValue
 */
const normalizeObjectIdMatchField = (fieldValue) => {
    if (fieldValue == null || typeof fieldValue !== 'object') {
        return toObjectIdIfValid(fieldValue);
    }
    if (Array.isArray(fieldValue)) {
        return fieldValue.map(toObjectIdIfValid);
    }
    if ('$in' in fieldValue && Array.isArray(fieldValue.$in)) {
        return { ...fieldValue, $in: fieldValue.$in.map(toObjectIdIfValid) };
    }
    if ('$nin' in fieldValue && Array.isArray(fieldValue.$nin)) {
        return { ...fieldValue, $nin: fieldValue.$nin.map(toObjectIdIfValid) };
    }
    if ('$eq' in fieldValue) {
        return { ...fieldValue, $eq: toObjectIdIfValid(fieldValue.$eq) };
    }
    return fieldValue;
};

/**
 * @param {Record<string, unknown>} productsQuery
 */
export const normalizeProductsQueryForAggregate = (productsQuery) => {
    const normalized = { ...productsQuery };
    if ('productSeller' in normalized) {
        normalized.productSeller = normalizeObjectIdMatchField(
            normalized.productSeller,
        );
    }
    if ('_id' in normalized) {
        normalized._id = normalizeObjectIdMatchField(normalized._id);
    }
    return normalized;
};

const SALE_COUNT_ITEM_STATUSES = [
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_CONFIRMED,
];

/**
 * @param {import('express').Request['query']} query
 */
export const parseProductSortFromQuery = (query) => {
    const raw = query?.sort;
    if (raw === PRODUCT_SORT_VIEWS || raw === PRODUCT_SORT_PURCHASES) {
        return raw;
    }
    return PRODUCT_SORT_NEWEST;
};

const soldQuantityLookupStage = () => ({
    $lookup: {
        from: 'orders',
        let: { productId: '$_id' },
        pipeline: [
            { $unwind: '$items' },
            {
                $match: {
                    $expr: {
                        $eq: ['$items.productId', '$$productId'],
                    },
                    'items.status': { $in: SALE_COUNT_ITEM_STATUSES },
                },
            },
            {
                $group: {
                    _id: null,
                    soldQuantity: { $sum: '$items.quantity' },
                },
            },
        ],
        as: 'salesStats',
    },
});

const soldQuantityAddFieldsStage = () => ({
    $addFields: {
        soldQuantity: {
            $ifNull: [
                { $arrayElemAt: ['$salesStats.soldQuantity', 0] },
                0,
            ],
        },
    },
});

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

const sortStageForCatalog = (sort) => {
    if (sort === PRODUCT_SORT_PURCHASES) {
        return { $sort: { soldQuantity: -1, createdAt: -1 } };
    }
    if (sort === PRODUCT_SORT_VIEWS) {
        return { $sort: { uniqueViewerCount: -1, createdAt: -1 } };
    }
    return { $sort: { createdAt: -1 } };
};

/**
 * @param {Record<string, unknown>} productsQuery
 * @param {string} sort
 * @param {number} skip
 * @param {number} limit
 */
export const findProductsPage = async (productsQuery, sort, skip, limit) => {
    const products = await ProductModel.aggregate([
        { $match: normalizeProductsQueryForAggregate(productsQuery) },
        soldQuantityLookupStage(),
        soldQuantityAddFieldsStage(),
        sortStageForCatalog(sort),
        { $skip: skip },
        { $limit: limit },
        ...sellerLookupStages(),
    ]);

    return attachProductSellerSnapshots(products);
};

/**
 * @param {Record<string, unknown>} productsQuery
 */
export const countProducts = (productsQuery) =>
    ProductModel.countDocuments(productsQuery);
