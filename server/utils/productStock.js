import mongoose from 'mongoose';

import {
    ORDER_STATUS_CANCELLED,
    ORDER_STATUS_CONFIRMED,
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_PENDING,
    ORDER_STATUS_SHIPPED,
} from '../constants/orderConstants.js';
import {
    PRODUCT_STOCK_INSUFFICIENT_MESSAGE,
    PRODUCT_STOCK_PATCH_BELOW_RESERVED_MESSAGE,
    PRODUCT_STOCK_PATCH_INVALID_MESSAGE,
    PRODUCT_STOCK_QUANTITY_MAX,
    PRODUCT_STOCK_QUANTITY_MIN,
    PRODUCT_STOCK_REQUIRED_WHEN_AVAILABLE_MESSAGE,
} from '../constants/productStockConstants.js';
import { PRODUCT_MODERATION_APPROVED } from '../constants/productModerationConstants.js';
import { OrderModel, ProductModel, RaffleModel } from '../models/index.js';
import { RAFFLE_STATUS_COMPLETED } from '../constants/raffleConstants.js';
import { recalculateRaffleSalesProgress } from './raffleHelpers.js';

export const STOCK_RESERVATION_ITEM_STATUSES = [
    ORDER_STATUS_PENDING,
    ORDER_STATUS_SHIPPED,
    ORDER_STATUS_DELIVERED,
];

/**
 * @param {unknown} raw
 * @returns {number | null}
 */
export const parseProductStockQuantityInput = (raw) => {
    if (raw === undefined || raw === null || raw === '') {
        return null;
    }
    const value = Math.floor(Number(raw));
    if (!Number.isFinite(value)) {
        return null;
    }
    return value;
};

/**
 * @param {boolean} listedInCatalog
 * @param {unknown} rawStock
 */
export const resolveProductStockQuantityForWrite = (listedInCatalog, rawStock) => {
    if (!listedInCatalog) {
        return 0;
    }
    const parsed = parseProductStockQuantityInput(rawStock);
    if (
        parsed == null ||
        parsed < PRODUCT_STOCK_QUANTITY_MIN ||
        parsed > PRODUCT_STOCK_QUANTITY_MAX
    ) {
        throw new Error(PRODUCT_STOCK_REQUIRED_WHEN_AVAILABLE_MESSAGE);
    }
    return parsed;
};

/**
 * @param {string[]} productIds
 * @returns {Promise<Record<string, number>>}
 */
export const getReservedQuantityByProductIds = async (productIds) => {
    const ids = [
        ...new Set(
            productIds
                .map((id) => String(id))
                .filter((id) => mongoose.isValidObjectId(id)),
        ),
    ];
    if (ids.length === 0) {
        return {};
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const rows = await OrderModel.aggregate([
        { $unwind: '$items' },
        {
            $match: {
                'items.productId': { $in: objectIds },
                'items.status': { $in: STOCK_RESERVATION_ITEM_STATUSES },
            },
        },
        {
            $group: {
                _id: '$items.productId',
                reservedQuantity: { $sum: '$items.quantity' },
            },
        },
    ]);

    return Object.fromEntries(
        rows.map((row) => [String(row._id), Number(row.reservedQuantity) || 0]),
    );
};

/**
 * @param {{ _id?: unknown; productStockQuantity?: unknown }} product
 * @param {Record<string, number>} reservedByProductId
 */
export const getProductAvailablePurchaseQuantity = (product, reservedByProductId) => {
    const stock = Math.max(0, Math.floor(Number(product.productStockQuantity) || 0));
    const reserved = reservedByProductId[String(product._id)] ?? 0;
    return Math.max(0, stock - reserved);
};

/**
 * @param {string} productId
 */
export const getMinimumAllowedProductStockQuantity = async (productId) => {
    const reservedById = await getReservedQuantityByProductIds([productId]);
    return reservedById[String(productId)] ?? 0;
};

/**
 * @param {string} productId
 * @param {number} nextStock
 */
export const assertProductStockPatchAllowed = async (productId, nextStock) => {
    const parsed = Math.floor(Number(nextStock));
    if (
        !Number.isFinite(parsed) ||
        parsed < 0 ||
        parsed > PRODUCT_STOCK_QUANTITY_MAX
    ) {
        throw new Error(PRODUCT_STOCK_PATCH_INVALID_MESSAGE);
    }
    const minAllowed = await getMinimumAllowedProductStockQuantity(productId);
    if (parsed < minAllowed) {
        throw new Error(PRODUCT_STOCK_PATCH_BELOW_RESERVED_MESSAGE);
    }
    return parsed;
};

/**
 * @param {Array<{ productId: string; quantity: number }>} items
 * @param {string} buyerUserId
 */
export const assertOrderItemsWithinAvailableStock = async (items, buyerUserId) => {
    const productIds = [...new Set(items.map((item) => String(item.productId)))];
    const products = await ProductModel.find({
        _id: { $in: productIds },
        productModerationStatus: PRODUCT_MODERATION_APPROVED,
        productIsAvailable: { $ne: false },
        productStockQuantity: { $gt: 0 },
    })
        .select('_id productStockQuantity productSeller')
        .lean();

    if (products.length !== productIds.length) {
        throw new Error('Один или несколько товаров не найдены или недоступны');
    }

    for (const product of products) {
        if (String(product.productSeller) === String(buyerUserId)) {
            throw new Error('Нельзя купить свой товар');
        }
    }

    const reservedById = await getReservedQuantityByProductIds(productIds);
    const requestedById = items.reduce((acc, item) => {
        const id = String(item.productId);
        acc[id] = (acc[id] ?? 0) + item.quantity;
        return acc;
    }, {});

    for (const product of products) {
        const id = String(product._id);
        const available = getProductAvailablePurchaseQuantity(product, reservedById);
        const requested = requestedById[id] ?? 0;
        if (requested > available) {
            throw new Error(PRODUCT_STOCK_INSUFFICIENT_MESSAGE);
        }
    }
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const clearProductRaffleParticipation = async (productId) => {
    const product = await ProductModel.findById(productId).select(
        'activeRaffleId raffleParticipationEnabledAt',
    );
    if (!product?.raffleParticipationEnabledAt) {
        return;
    }
    const previousRaffleId = product.activeRaffleId;

    if (previousRaffleId) {
        await recalculateRaffleSalesProgress(previousRaffleId);
        const raffleAfter = await RaffleModel.findById(previousRaffleId)
            .select('status')
            .lean();
        if (raffleAfter?.status === RAFFLE_STATUS_COMPLETED) {
            return;
        }
    }

    product.activeRaffleId = null;
    product.raffleParticipationEnabledAt = null;
    await product.save();
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const syncProductCatalogAfterStockChange = async (productId) => {
    const product = await ProductModel.findById(productId)
        .select('productStockQuantity productModerationStatus productIsAvailable')
        .lean();
    if (!product) {
        return;
    }

    const stock = Math.max(0, Math.floor(Number(product.productStockQuantity) || 0));
    if (stock > 0) {
        return;
    }

    await ProductModel.updateOne(
        { _id: productId },
        { $set: { productStockQuantity: 0, productIsAvailable: false } },
    );
    await clearProductRaffleParticipation(productId);
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {number} quantity
 */
export const decrementProductStockOnItemConfirmed = async (productId, quantity) => {
    const qty = Math.max(0, Math.floor(Number(quantity)) || 0);
    if (qty === 0) {
        return;
    }

    const updated = await ProductModel.findByIdAndUpdate(
        productId,
        { $inc: { productStockQuantity: -qty } },
        { new: true },
    ).select('productStockQuantity');

    if (!updated) {
        return;
    }

    if ((Number(updated.productStockQuantity) || 0) < 0) {
        await ProductModel.updateOne(
            { _id: productId },
            { $set: { productStockQuantity: 0 } },
        );
    }

    await syncProductCatalogAfterStockChange(productId);
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {number} quantity
 * @param {string} previousItemStatus
 */
export const restoreProductStockOnItemCancelled = async (
    productId,
    quantity,
    previousItemStatus,
) => {
    const qty = Math.max(0, Math.floor(Number(quantity)) || 0);
    if (qty === 0) {
        return;
    }

    if (previousItemStatus === ORDER_STATUS_CONFIRMED) {
        await ProductModel.findByIdAndUpdate(productId, {
            $inc: { productStockQuantity: qty },
        });
    }
};

/**
 * @param {Record<string, unknown>[]} products
 */
export const attachProductAvailablePurchaseQuantity = async (products) => {
    if (!Array.isArray(products) || products.length === 0) {
        return products;
    }

    const reservedById = await getReservedQuantityByProductIds(
        products.map((product) => String(product._id)),
    );

    return products.map((product) => ({
        ...product,
        productAvailableQuantity: getProductAvailablePurchaseQuantity(
            product,
            reservedById,
        ),
    }));
};
