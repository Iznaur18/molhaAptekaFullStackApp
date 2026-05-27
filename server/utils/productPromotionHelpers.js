import { ProductModel, ProductPromotionModel, ProductPromotionTariffModel } from '../models/index.js';
import {
    PRODUCT_PROMOTION_DEFAULT_TARIFFS,
    PRODUCT_PROMOTION_REMINDER_HOURS,
    PRODUCT_PROMOTION_STATUS_ACTIVE,
    PRODUCT_PROMOTION_STATUS_EXPIRED,
} from '../constants/productPromotionConstants.js';
import { createUserInAppNotification } from './userInAppNotifications.js';

export const PRODUCT_PROMOTION_NOTIFICATION_KIND_REMINDER = 'product_promotion_expiring_soon';
export const PRODUCT_PROMOTION_NOTIFICATION_KIND_EXPIRED = 'product_promotion_expired';
export const PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED = 'product_promotion_approved';
export const PRODUCT_PROMOTION_NOTIFICATION_KIND_REJECTED = 'product_promotion_rejected';
export const PRODUCT_PROMOTION_NOTIFICATION_KIND_CANCELLED = 'product_promotion_cancelled';

export const ensureProductPromotionTariffs = async () => {
    const count = await ProductPromotionTariffModel.countDocuments({});
    if (count > 0) {
        return;
    }
    await ProductPromotionTariffModel.insertMany(
        PRODUCT_PROMOTION_DEFAULT_TARIFFS.map((item, index) => ({
            ...item,
            order: index,
        })),
    );
};

export const getActiveProductPromotionTariffs = async () => {
    await ensureProductPromotionTariffs();
    return ProductPromotionTariffModel.find({ isActive: true })
        .sort({ order: 1, durationHours: 1 })
        .lean();
};

export const clearProductPromotionForProduct = async (productId) => {
    await ProductModel.updateOne(
        { _id: productId },
        { $set: { catalogPromotionActivatedAt: null, catalogPromotionExpiresAt: null } },
    );
};

export const setProductPromotionForProduct = async ({
    productId,
    activatedAt,
    activeUntil,
}) => {
    await ProductModel.updateOne(
        { _id: productId },
        {
            $set: {
                catalogPromotionActivatedAt: activatedAt,
                catalogPromotionExpiresAt: activeUntil,
            },
        },
    );
};

export const expireProductPromotionsAndSendNotifications = async () => {
    const now = new Date();
    const oneHourAhead = new Date(
        now.getTime() + PRODUCT_PROMOTION_REMINDER_HOURS * 60 * 60 * 1000,
    );

    const expiredRows = await ProductPromotionModel.find({
        status: PRODUCT_PROMOTION_STATUS_ACTIVE,
        activeUntil: { $lte: now },
    })
        .select('_id sellerId productId activeUntil')
        .lean();

    if (expiredRows.length > 0) {
        const expiredIds = expiredRows.map((row) => row._id);
        await ProductPromotionModel.updateMany(
            { _id: { $in: expiredIds } },
            { $set: { status: PRODUCT_PROMOTION_STATUS_EXPIRED } },
        );
        await Promise.all(
            expiredRows.map(async (row) => {
                await clearProductPromotionForProduct(row.productId);
                await createUserInAppNotification({
                    userId: row.sellerId,
                    kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_EXPIRED,
                    message: 'Продвижение товара завершилось',
                    productId: row.productId,
                });
            }),
        );
    }

    const reminderRows = await ProductPromotionModel.find({
        status: PRODUCT_PROMOTION_STATUS_ACTIVE,
        activeUntil: { $gt: now, $lte: oneHourAhead },
        reminderSentAt: null,
    })
        .select('_id sellerId productId')
        .lean();

    if (reminderRows.length === 0) {
        return;
    }
    const reminderIds = reminderRows.map((row) => row._id);
    await ProductPromotionModel.updateMany(
        { _id: { $in: reminderIds }, reminderSentAt: null },
        { $set: { reminderSentAt: now } },
    );
    await Promise.all(
        reminderRows.map((row) =>
            createUserInAppNotification({
                userId: row.sellerId,
                kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_REMINDER,
                message: 'Продвижение товара закончится примерно через 1 час',
                productId: row.productId,
            }),
        ),
    );
};
