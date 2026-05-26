import { UserInAppNotificationModel } from '../models/index.js';

const NOTIFICATION_LIST_LIMIT = 20;

/**
 * @param {{
 *   userId: import('mongoose').Types.ObjectId | string;
 *   kind: string;
 *   message: string;
 *   productId?: import('mongoose').Types.ObjectId | string | null;
 *   actorUserId?: import('mongoose').Types.ObjectId | string | null;
 * }} params
 */
export const createUserInAppNotification = async ({
    userId,
    kind,
    message,
    productId = null,
    actorUserId = null,
}) => {
    await UserInAppNotificationModel.create({
        userId,
        kind,
        message,
        productId: productId ?? null,
        actorUserId: actorUserId ?? null,
    });
};

/**
 * @param {string} userId
 */
export const getUnreadInAppNotificationsForUser = async (userId) => {
    const rows = await UserInAppNotificationModel.find({
        userId,
        readAt: null,
    })
        .sort({ createdAt: -1 })
        .limit(NOTIFICATION_LIST_LIMIT)
        .lean();

    return rows.map((row) => ({
        _id: String(row._id),
        kind: row.kind,
        message: row.message,
        productId: row.productId ? String(row.productId) : null,
        actorUserId: row.actorUserId ? String(row.actorUserId) : null,
        createdAt: row.createdAt,
    }));
};

/**
 * @param {string} userId
 */
export const markAllInAppNotificationsReadForUser = async (userId) => {
    await UserInAppNotificationModel.updateMany(
        { userId, readAt: null },
        { $set: { readAt: new Date() } },
    );
};
