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
 * @param {Record<string, unknown>} productsQuery
 * @param {string} sort
 * @param {number} skip
 * @param {number} limit
 */
export const findProductsPage = async (productsQuery, sort, skip, limit) => {
    if (sort === PRODUCT_SORT_PURCHASES) {
        return ProductModel.aggregate([
            { $match: productsQuery },
            {
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
            },
            {
                $addFields: {
                    soldQuantity: {
                        $ifNull: [
                            { $arrayElemAt: ['$salesStats.soldQuantity', 0] },
                            0,
                        ],
                    },
                },
            },
            { $sort: { soldQuantity: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            ...sellerLookupStages(),
        ]);
    }

    const sortSpec =
        sort === PRODUCT_SORT_VIEWS
            ? { uniqueViewerCount: -1, createdAt: -1 }
            : { createdAt: -1 };

    return ProductModel.find(productsQuery)
        .populate('productSeller', 'userName email userPhoneNumber _id userRatingByVotes')
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .lean();
};

/**
 * @param {Record<string, unknown>} productsQuery
 */
export const countProducts = (productsQuery) =>
    ProductModel.countDocuments(productsQuery);
