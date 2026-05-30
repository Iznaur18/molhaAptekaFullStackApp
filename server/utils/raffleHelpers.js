import mongoose from 'mongoose';

import { ORDER_STATUS_CONFIRMED } from '../constants/orderConstants.js';
import {
    RAFFLE_STATUS_ACTIVE,
    RAFFLE_STATUS_COMPLETED,
    RAFFLE_STATUS_PAUSED,
    SITE_RAFFLES_ACTIVE_VITRINE_MAX,
    SITE_RAFFLES_COMPLETED_VITRINE_MAX,
} from '../constants/raffleConstants.js';
import { PRODUCT_MODERATION_APPROVED } from '../constants/productModerationConstants.js';
import { OrderModel, ProductModel, RaffleModel, UserModel } from '../models/index.js';
import { createUserInAppNotification } from './userInAppNotifications.js';
import { notifyFollowersOfSellerRaffleCompleted } from './userFollowHelpers.js';
import { normalizeRafflePrizeImageFocus } from './profileImageFocus.js';
import {
    applyRafflePrizeMediaFields,
    normalizePrizeMediaType,
} from './rafflePrizeMedia.js';

const RAFFLE_SALE_COUNT_ITEM_STATUSES = [ORDER_STATUS_CONFIRMED];

export const RAFFLE_NOTIFICATION_KIND_GOAL_REACHED = 'raffle_goal_reached';
export const RAFFLE_NOTIFICATION_KIND_COMPLETED = 'raffle_completed';

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {Date} participationStartAt
 */
const countRaffleSalesForProductSince = async (productId, participationStartAt) => {
    const objectId = new mongoose.Types.ObjectId(String(productId));
    const startMs = participationStartAt.getTime();

    const rows = await OrderModel.aggregate([
        { $unwind: '$items' },
        {
            $match: {
                'items.productId': objectId,
                'items.status': { $in: RAFFLE_SALE_COUNT_ITEM_STATUSES },
            },
        },
        {
            $match: {
                'items.confirmedAt': { $ne: null, $gte: participationStartAt },
            },
        },
        {
            $group: {
                _id: null,
                soldQuantity: { $sum: '$items.quantity' },
            },
        },
    ]);

    return Number(rows[0]?.soldQuantity) || 0;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} raffleId
 */
export const recalculateRaffleSalesProgress = async (raffleId) => {
    const raffle = await RaffleModel.findById(raffleId).lean();
    if (!raffle || raffle.status !== RAFFLE_STATUS_ACTIVE) {
        return raffle;
    }

    const activatedAt = raffle.approvedAt;
    if (!activatedAt) {
        return raffle;
    }

    const products = await ProductModel.find({
        activeRaffleId: raffleId,
        raffleParticipationEnabledAt: { $ne: null },
    })
        .select('_id raffleParticipationEnabledAt')
        .lean();

    let salesProgress = 0;
    for (const product of products) {
        const participationStartAt = new Date(
            Math.max(
                new Date(activatedAt).getTime(),
                new Date(product.raffleParticipationEnabledAt).getTime(),
            ),
        );
        salesProgress += await countRaffleSalesForProductSince(
            product._id,
            participationStartAt,
        );
    }

    const targetSales = Number(raffle.targetSales) || 0;

    if (salesProgress >= targetSales && targetSales > 0) {
        await completeRaffleById(raffleId, salesProgress);
        return RaffleModel.findById(raffleId).lean();
    }

    await RaffleModel.updateOne({ _id: raffleId }, { $set: { salesProgress } });

    return RaffleModel.findById(raffleId).lean();
};

/**
 * @param {import('mongoose').Types.ObjectId | string} raffleId
 * @param {number} [salesProgress]
 */
export const completeRaffleById = async (raffleId, salesProgress) => {
    const raffle = await RaffleModel.findById(raffleId).lean();
    if (!raffle || raffle.status === RAFFLE_STATUS_COMPLETED) {
        return raffle;
    }

    const progress =
        salesProgress != null ? salesProgress : Number(raffle.salesProgress) || 0;

    await RaffleModel.updateOne(
        { _id: raffleId },
        {
            $set: {
                status: RAFFLE_STATUS_COMPLETED,
                salesProgress: progress,
                completedAt: new Date(),
            },
        },
    );

    await clearRaffleParticipationFromProducts(raffleId);

    try {
        await createUserInAppNotification({
            userId: raffle.sellerId,
            kind: RAFFLE_NOTIFICATION_KIND_GOAL_REACHED,
            message: `Розыгрыш «${raffle.title}» завершён`,
        });
        await notifyFollowersOfSellerRaffleCompleted(raffle);
    } catch (error) {
        console.error('completeRaffleById notifications error:', error);
    }

    return RaffleModel.findById(raffleId).lean();
};

/**
 * @param {import('mongoose').Types.ObjectId | string} raffleId
 */
export const clearRaffleParticipationFromProducts = async (raffleId) => {
    await ProductModel.updateMany(
        { activeRaffleId: raffleId },
        {
            $set: {
                activeRaffleId: null,
                raffleParticipationEnabledAt: null,
            },
        },
    );
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const syncRaffleProgressForProductSale = async (productId) => {
    const product = await ProductModel.findById(productId)
        .select('activeRaffleId raffleParticipationEnabledAt')
        .lean();

    if (!product?.activeRaffleId || !product.raffleParticipationEnabledAt) {
        return;
    }

    await recalculateRaffleSalesProgress(product.activeRaffleId);
};

export {
    applyRafflePrizeMediaFields,
    applyRafflePrizeMediaFields as applyRafflePrizeImageFields,
};

export const toPublicRafflePayload = (raffle, options = {}) => {
    const { includeInstagram = false, includePrivateFields = false, seller = null } =
        options;
    const status = raffle.status;
    const showInstagram =
        (includeInstagram && status === RAFFLE_STATUS_COMPLETED) ||
        (includePrivateFields && Boolean(raffle.instagramUrl));

    return {
        _id: String(raffle._id),
        sellerId: String(raffle.sellerId),
        title: raffle.title,
        description: raffle.description ?? '',
        prizeImageUrl: raffle.prizeImageUrl ?? '',
        prizeMediaType: normalizePrizeMediaType(raffle.prizeMediaType),
        prizeVideoUrl: raffle.prizeVideoUrl ?? '',
        prizeImageFocus: normalizeRafflePrizeImageFocus(raffle.prizeImageFocus),
        targetSales: Number(raffle.targetSales) || 0,
        salesProgress: Number(raffle.salesProgress) || 0,
        status,
        instagramUrl: showInstagram ? raffle.instagramUrl : null,
        moderationComment:
            status === 'rejected' ? raffle.moderationComment ?? '' : '',
        approvedAt: raffle.approvedAt ?? null,
        completedAt: raffle.completedAt ?? null,
        createdAt: raffle.createdAt,
        updatedAt: raffle.updatedAt,
        seller: seller
            ? {
                  _id: String(seller._id),
                  userName: seller.userName ?? null,
              }
            : null,
    };
};

/**
 * @param {string} sellerId
 */
export const assertSellerCanCreateRaffle = async (sellerId) => {
    const user = await UserModel.findById(sellerId)
        .select('isUserDataConfirmed isBlockedUser')
        .lean();

    if (!user) {
        return { ok: false, message: 'Пользователь не найден' };
    }
    if (user.isBlockedUser) {
        return { ok: false, message: 'Аккаунт заблокирован' };
    }
    if (user.isUserDataConfirmed !== true) {
        return {
            ok: false,
            message: 'Розыгрыш доступен только с подтверждёнными данными',
        };
    }

    const existing = await RaffleModel.findOne({
        sellerId,
        status: { $in: ['pending_staff', 'active', 'paused'] },
    }).lean();

    if (existing) {
        return {
            ok: false,
            message: 'У вас уже есть розыгрыш в работе или на модерации',
        };
    }

    return { ok: true };
};

/**
 * @param {string} sellerId
 */
export const getSellerActiveRaffle = async (sellerId) => {
    return RaffleModel.findOne({
        sellerId,
        status: { $in: ['pending_staff', 'active', 'paused'] },
    })
        .sort({ createdAt: -1 })
        .lean();
};

/** @deprecated используйте getFeaturedSiteRaffles */
export const getFeaturedSiteRaffle = async () => {
    const rows = await getFeaturedSiteRaffles();
    return rows[0] ?? null;
};

export const getFeaturedSiteRaffles = async () => {
    const actives = await RaffleModel.find({ status: RAFFLE_STATUS_ACTIVE })
        .sort({ approvedAt: -1 })
        .limit(SITE_RAFFLES_ACTIVE_VITRINE_MAX)
        .lean();

    const completed = await RaffleModel.find({ status: RAFFLE_STATUS_COMPLETED })
        .sort({ completedAt: -1 })
        .limit(SITE_RAFFLES_COMPLETED_VITRINE_MAX)
        .lean();

    return [...actives, ...completed];
};

export const assertSiteActiveRafflesWithinLimit = async (excludeRaffleId) => {
    const query = { status: RAFFLE_STATUS_ACTIVE };
    if (excludeRaffleId) {
        query._id = { $ne: excludeRaffleId };
    }
    const activeCount = await RaffleModel.countDocuments(query);
    if (activeCount >= SITE_RAFFLES_ACTIVE_VITRINE_MAX) {
        return {
            ok: false,
            message: `На витрине уже ${SITE_RAFFLES_ACTIVE_VITRINE_MAX} активных розыгрышей. Снимите один с витрины или дождитесь завершения.`,
        };
    }
    return { ok: true };
};

/** @deprecated */
export const assertNoOtherActiveSiteRaffle = assertSiteActiveRafflesWithinLimit;

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {string} sellerId
 */
export const assertProductCanJoinRaffle = async (productId, sellerId) => {
    const product = await ProductModel.findById(productId).lean();
    if (!product) {
        return { ok: false, message: 'Товар не найден' };
    }
    if (String(product.productSeller) !== String(sellerId)) {
        return { ok: false, message: 'Можно подключать только свои товары' };
    }
    if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
        return { ok: false, message: 'Товар должен быть одобрен модерацией' };
    }
    if (product.productIsAvailable === false) {
        return { ok: false, message: 'Скрытый товар нельзя добавить в розыгрыш' };
    }
    if ((Number(product.productStockQuantity) || 0) <= 0) {
        return { ok: false, message: 'Нет товара в наличии для розыгрыша' };
    }

    const raffle = await getSellerActiveRaffle(sellerId);
    if (!raffle || raffle.status !== RAFFLE_STATUS_ACTIVE) {
        return { ok: false, message: 'Нет активного розыгрыша' };
    }

    return { ok: true, raffle, product };
};
