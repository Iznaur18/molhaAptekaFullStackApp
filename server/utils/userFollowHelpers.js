import mongoose from 'mongoose';

import {
    buildFollowedSellerNewProductMessage,
    buildFollowedSellerRaffleCompletedMessage,
    buildNewFollowerNotificationMessage,
    IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_NEW_PRODUCT,
    IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_RAFFLE_COMPLETED,
    IN_APP_NOTIFICATION_KIND_NEW_FOLLOWER,
    USER_FOLLOW_MAX_LIST_LIMIT,
} from '../constants/userFollowConstants.js';
import { PRODUCT_MODERATION_APPROVED } from '../constants/productModerationConstants.js';
import { UserFollowModel, UserModel } from '../models/index.js';
import { createUserInAppNotification } from './userInAppNotifications.js';
import { getHiddenSellerIds } from './adminUserGuard.js';

const USER_LIST_SELECT =
    'userName userAvatarUrl userAvatarFocus telegramPhotoUrl isPremiumUser isUserDataConfirmed userRatingByVotes';

/**
 * @param {string} followerId
 * @param {string} followingId
 */
export async function isUserFollowing(followerId, followingId) {
    if (!followerId || !followingId || followerId === followingId) {
        return false;
    }
    const row = await UserFollowModel.findOne({
        followerId,
        followingId,
    })
        .select('_id')
        .lean();
    return Boolean(row);
}

/**
 * @param {string} userId
 */
export async function getUserFollowCounts(userId) {
    const uid = new mongoose.Types.ObjectId(userId);
    const [followersCount, followingCount] = await Promise.all([
        UserFollowModel.countDocuments({ followingId: uid }),
        UserFollowModel.countDocuments({ followerId: uid }),
    ]);
    return { followersCount, followingCount };
}

/**
 * @param {string} followerId
 * @returns {Promise<string[]>}
 */
export async function getFollowingUserIdsForFollower(followerId) {
    const rows = await UserFollowModel.find({ followerId })
        .select('followingId')
        .lean();
    return rows.map((row) => String(row.followingId));
}

/**
 * Seller ids among followed users, excluding blocked/inactive/admin (not shown in catalog).
 *
 * @param {string} followerId
 * @returns {Promise<string[]>}
 */
export async function getVisibleFollowingSellerIds(followerId) {
    const followingIds = await getFollowingUserIdsForFollower(followerId);
    if (followingIds.length === 0) return [];

    const hiddenSellerIds = new Set(
        (await getHiddenSellerIds()).map((id) => String(id)),
    );

    return followingIds.filter((id) => !hiddenSellerIds.has(String(id)));
}

/**
 * @param {string} userId
 */
export async function deleteAllFollowsForUser(userId) {
    const uid = new mongoose.Types.ObjectId(userId);
    await UserFollowModel.deleteMany({
        $or: [{ followerId: uid }, { followingId: uid }],
    });
}

/**
 * @param {string} followerId
 * @param {string} followingId
 */
export async function followUser(followerId, followingId) {
    if (String(followerId) === String(followingId)) {
        return { ok: false, status: 400, message: 'SELF' };
    }

    const target = await UserModel.findById(followingId)
        .select('userName isBlockedUser userRole')
        .lean();

    if (!target) {
        return { ok: false, status: 404, message: 'NOT_FOUND' };
    }
    if (target.isBlockedUser) {
        return { ok: false, status: 403, message: 'BLOCKED' };
    }

    await UserFollowModel.updateOne(
        { followerId, followingId },
        { $setOnInsert: { followerId, followingId } },
        { upsert: true },
    );

    const follower = await UserModel.findById(followerId)
        .select('userName')
        .lean();

    await createUserInAppNotification({
        userId: followingId,
        kind: IN_APP_NOTIFICATION_KIND_NEW_FOLLOWER,
        message: buildNewFollowerNotificationMessage(follower?.userName),
        actorUserId: followerId,
    });

    const counts = await getUserFollowCounts(followingId);
    return {
        ok: true,
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
    };
}

/**
 * @param {string} followerId
 * @param {string} followingId
 */
export async function unfollowUser(followerId, followingId) {
    await UserFollowModel.deleteOne({ followerId, followingId });
    const counts = await getUserFollowCounts(followingId);
    return {
        ok: true,
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
    };
}

/**
 * @param {{
 *   userId: string;
 *   role: 'follower' | 'following';
 *   page?: number;
 *   limit?: number;
 * }} params
 */
export async function listUserFollowRelations({
    userId,
    role,
    page = 1,
    limit = USER_FOLLOW_MAX_LIST_LIMIT,
}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(
        USER_FOLLOW_MAX_LIST_LIMIT,
        Math.max(1, Number(limit) || USER_FOLLOW_MAX_LIST_LIMIT),
    );
    const skip = (safePage - 1) * safeLimit;

    const filter =
        role === 'followers'
            ? { followingId: userId }
            : { followerId: userId };

    const [rows, total] = await Promise.all([
        UserFollowModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .populate(
                role === 'followers' ? 'followerId' : 'followingId',
                USER_LIST_SELECT,
            )
            .lean(),
        UserFollowModel.countDocuments(filter),
    ]);

    const users = rows
        .map((row) =>
            role === 'followers' ? row.followerId : row.followingId,
        )
        .filter(Boolean)
        .map((user) => ({
            ...user,
            _id: String(user._id),
        }));

    return {
        users,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit) || 0,
        },
    };
}

/**
 * @param {Record<string, unknown>} product — одобренный товар в каталоге
 */
export async function notifyFollowersOfSellerNewCatalogProduct(product) {
    if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
        return;
    }
    if (product.productIsAvailable === false) {
        return;
    }

    const sellerId = product.productSeller?._id ?? product.productSeller;
    if (!sellerId) return;

    const followerRows = await UserFollowModel.find({
        followingId: sellerId,
    })
        .select('followerId')
        .lean();

    if (followerRows.length === 0) return;

    const seller = await UserModel.findById(sellerId)
        .select('userName')
        .lean();
    const productId = product._id;
    const message = buildFollowedSellerNewProductMessage(
        seller?.userName,
        product.productName,
    );

    await Promise.all(
        followerRows.map((row) =>
            createUserInAppNotification({
                userId: row.followerId,
                kind: IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_NEW_PRODUCT,
                message,
                productId,
                actorUserId: String(sellerId),
            }),
        ),
    );
}

/**
 * @param {Record<string, unknown>} raffle
 */
export async function notifyFollowersOfSellerRaffleCompleted(raffle) {
    const sellerId = raffle.sellerId;
    if (!sellerId) return;

    const followerRows = await UserFollowModel.find({ followingId: sellerId })
        .select('followerId')
        .lean();

    if (followerRows.length === 0) return;

    const seller = await UserModel.findById(sellerId).select('userName').lean();
    const message = buildFollowedSellerRaffleCompletedMessage(
        seller?.userName,
        raffle.title,
    );

    await Promise.all(
        followerRows.map((row) =>
            createUserInAppNotification({
                userId: row.followerId,
                kind: IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_RAFFLE_COMPLETED,
                message,
                actorUserId: String(sellerId),
            }),
        ),
    );
}

/**
 * @param {Record<string, unknown>} user
 * @param {{ viewerId?: string | null }} ctx
 */
export async function attachFollowFieldsToPublicProfile(user, ctx) {
    const userId = String(user._id ?? '');
    const counts = await getUserFollowCounts(userId);
    const out = {
        ...user,
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
    };

    const viewerId = ctx.viewerId ? String(ctx.viewerId) : '';
    if (viewerId && viewerId !== userId) {
        out.isFollowing = await isUserFollowing(viewerId, userId);
    }

    return out;
}

/**
 * @param {Record<string, unknown>[]} users
 */
export async function attachFollowersCountToUsers(users) {
    if (!Array.isArray(users) || users.length === 0) {
        return users;
    }

    const ids = users
        .map((user) => user._id)
        .filter(Boolean)
        .map((id) => new mongoose.Types.ObjectId(String(id)));

    if (ids.length === 0) {
        return users.map((user) => ({ ...user, followersCount: 0 }));
    }

    const rows = await UserFollowModel.aggregate([
        { $match: { followingId: { $in: ids } } },
        { $group: { _id: '$followingId', followersCount: { $sum: 1 } } },
    ]);

    const countByUserId = new Map(
        rows.map((row) => [String(row._id), row.followersCount]),
    );

    return users.map((user) => ({
        ...user,
        followersCount: countByUserId.get(String(user._id)) ?? 0,
    }));
}
