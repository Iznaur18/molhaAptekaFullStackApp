import { ProductModel, ProductPromotionModel } from '../../models/index.js';
import {
    PRODUCT_MODERATION_APPROVED,
} from '../../constants/productModerationConstants.js';
import {
    PRODUCT_PROMOTION_STATUS_ACTIVE,
    PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
    PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
    PRODUCT_PROMOTION_STATUS_REJECTED,
} from '../../constants/productPromotionConstants.js';
import {
    clearProductPromotionForProduct,
    expireProductPromotionsAndSendNotifications,
    getActiveProductPromotionTariffs,
    PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
    PRODUCT_PROMOTION_NOTIFICATION_KIND_CANCELLED,
    PRODUCT_PROMOTION_NOTIFICATION_KIND_REJECTED,
    setProductPromotionForProduct,
} from '../../utils/productPromotionHelpers.js';
import { createUserInAppNotification } from '../../utils/userInAppNotifications.js';
import { errorRes, successRes } from '../../utils/index.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const toPromotionPayload = (row) => ({
    _id: String(row._id),
    productId: String(row.productId),
    sellerId: String(row.sellerId),
    status: row.status,
    tariffCode: row.tariffCode,
    tariffTitle: row.tariffTitle,
    durationHours: row.durationHours,
    amountRub: row.amountRub,
    productName: row.productName ?? null,
    approvedByUserId: row.approvedByUserId ? String(row.approvedByUserId) : null,
    activatedAt: row.activatedAt,
    activeUntil: row.activeUntil,
    cancelledAt: row.cancelledAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
});

export const getProductPromotionTariffsController = async (req, res) => {
    try {
        const tariffs = await getActiveProductPromotionTariffs();
        return successRes(res, {
            tariffs: tariffs.map((tariff) => ({
                code: tariff.code,
                title: tariff.title,
                durationHours: tariff.durationHours,
                priceRub: tariff.priceRub,
            })),
        });
    } catch (error) {
        console.error('getProductPromotionTariffsController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке тарифов продвижения');
    }
};

export const requestProductPromotionController = async (req, res) => {
    try {
        const userId = String(req.userId);
        const { productId } = req.params;
        const tariffCode = String(req.body?.tariffCode || '').trim();

        if (!tariffCode) {
            return errorRes(res, 400, 'Выберите пакет продвижения');
        }

        const [product, tariffs] = await Promise.all([
            ProductModel.findById(productId).lean(),
            getActiveProductPromotionTariffs(),
        ]);
        if (!product) {
            return errorRes(res, 404, 'Товар не найден');
        }
        if (String(product.productSeller) !== userId) {
            return errorRes(res, 403, 'Продвижение доступно только владельцу товара');
        }
        if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
            return errorRes(res, 409, 'Товар должен быть одобрен модерацией');
        }
        if (product.productIsAvailable === false) {
            return errorRes(res, 409, 'Скрытый товар нельзя продвигать');
        }

        const tariff = tariffs.find((item) => item.code === tariffCode);
        if (!tariff) {
            return errorRes(res, 400, 'Пакет продвижения не найден');
        }

        const promotion = await ProductPromotionModel.create({
            productId,
            sellerId: userId,
            status: PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
            tariffCode: tariff.code,
            tariffTitle: tariff.title,
            durationHours: tariff.durationHours,
            amountRub: tariff.priceRub,
        });

        return successRes(res, {
            message: 'Заявка отправлена на подтверждение',
            promotion: toPromotionPayload(promotion.toObject()),
        });
    } catch (error) {
        console.error('requestProductPromotionController error:', error);
        return errorRes(res, 500, 'Ошибка при создании заявки на продвижение');
    }
};

export const getMyProductPromotionsController = async (req, res) => {
    try {
        await expireProductPromotionsAndSendNotifications();
        const { page, limit, skip } = parsePagination(req.query);
        const statusRaw = String(req.query.status || '').trim();
        const filter = {
            sellerId: String(req.userId),
            ...(statusRaw ? { status: statusRaw } : {}),
        };

        const [rows, total] = await Promise.all([
            ProductPromotionModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ProductPromotionModel.countDocuments(filter),
        ]);

        return successRes(res, {
            promotions: rows.map(toPromotionPayload),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('getMyProductPromotionsController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке моих продвижений');
    }
};

export const getPendingProductPromotionsController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const filter = { status: PRODUCT_PROMOTION_STATUS_PENDING_STAFF };
        const [rows, total] = await Promise.all([
            ProductPromotionModel.aggregate([
                { $match: filter },
                { $sort: { createdAt: 1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productArr',
                    },
                },
                {
                    $addFields: {
                        productName: {
                            $arrayElemAt: ['$productArr.productName', 0],
                        },
                    },
                },
                { $project: { productArr: 0 } },
            ]),
            ProductPromotionModel.countDocuments(filter),
        ]);

        return successRes(res, {
            promotions: rows.map(toPromotionPayload),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('getPendingProductPromotionsController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке staff-очереди продвижения');
    }
};

export const getPendingProductPromotionsCountController = async (req, res) => {
    try {
        const totalPending = await ProductPromotionModel.countDocuments({
            status: PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
        });
        return successRes(res, { totalPending });
    } catch (error) {
        console.error('getPendingProductPromotionsCountController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке счётчика продвижения');
    }
};

export const approveProductPromotionController = async (req, res) => {
    try {
        await expireProductPromotionsAndSendNotifications();
        const { promotionId } = req.params;
        const promotion = await ProductPromotionModel.findById(promotionId);
        if (!promotion) {
            return errorRes(res, 404, 'Заявка продвижения не найдена');
        }
        if (promotion.status !== PRODUCT_PROMOTION_STATUS_PENDING_STAFF) {
            return errorRes(res, 409, 'Заявка уже обработана');
        }

        const activatedAt = new Date();
        const activeUntil = new Date(
            activatedAt.getTime() + promotion.durationHours * 60 * 60 * 1000,
        );
        promotion.status = PRODUCT_PROMOTION_STATUS_ACTIVE;
        promotion.approvedByUserId = req.userId;
        promotion.activatedAt = activatedAt;
        promotion.activeUntil = activeUntil;
        await promotion.save();

        await setProductPromotionForProduct({
            productId: promotion.productId,
            activatedAt,
            activeUntil,
        });
        await createUserInAppNotification({
            userId: promotion.sellerId,
            kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_APPROVED,
            message: 'Продвижение товара одобрено и уже активно',
            productId: promotion.productId,
            actorUserId: req.userId,
        });

        return successRes(res, {
            message: 'Продвижение активировано',
            promotion: toPromotionPayload(promotion.toObject()),
        });
    } catch (error) {
        console.error('approveProductPromotionController error:', error);
        return errorRes(res, 500, 'Ошибка при активации продвижения');
    }
};

export const rejectProductPromotionController = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const promotion = await ProductPromotionModel.findById(promotionId);
        if (!promotion) {
            return errorRes(res, 404, 'Заявка продвижения не найдена');
        }
        if (promotion.status !== PRODUCT_PROMOTION_STATUS_PENDING_STAFF) {
            return errorRes(res, 409, 'Заявка уже обработана');
        }

        promotion.status = PRODUCT_PROMOTION_STATUS_REJECTED;
        promotion.approvedByUserId = req.userId;
        await promotion.save();
        await createUserInAppNotification({
            userId: promotion.sellerId,
            kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_REJECTED,
            message: 'Заявка на продвижение отклонена staff-командой',
            productId: promotion.productId,
            actorUserId: req.userId,
        });

        return successRes(res, {
            message: 'Заявка отклонена',
            promotion: toPromotionPayload(promotion.toObject()),
        });
    } catch (error) {
        console.error('rejectProductPromotionController error:', error);
        return errorRes(res, 500, 'Ошибка при отклонении заявки');
    }
};

export const cancelProductPromotionByStaffController = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const promotion = await ProductPromotionModel.findById(promotionId);
        if (!promotion) {
            return errorRes(res, 404, 'Продвижение не найдено');
        }
        if (
            promotion.status !== PRODUCT_PROMOTION_STATUS_ACTIVE &&
            promotion.status !== PRODUCT_PROMOTION_STATUS_PENDING_STAFF
        ) {
            return errorRes(res, 409, 'Продвижение уже завершено');
        }

        promotion.status = PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN;
        promotion.cancelledAt = new Date();
        promotion.approvedByUserId = req.userId;
        await promotion.save();

        await clearProductPromotionForProduct(promotion.productId);
        await createUserInAppNotification({
            userId: promotion.sellerId,
            kind: PRODUCT_PROMOTION_NOTIFICATION_KIND_CANCELLED,
            message: 'Продвижение товара снято staff-командой',
            productId: promotion.productId,
            actorUserId: req.userId,
        });

        return successRes(res, {
            message: 'Продвижение снято',
            promotion: toPromotionPayload(promotion.toObject()),
        });
    } catch (error) {
        console.error('cancelProductPromotionByStaffController error:', error);
        return errorRes(res, 500, 'Ошибка при снятии продвижения');
    }
};

export const extendProductPromotionByStaffController = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const promotion = await ProductPromotionModel.findById(promotionId);
        if (!promotion) {
            return errorRes(res, 404, 'Продвижение не найдено');
        }
        if (promotion.status !== PRODUCT_PROMOTION_STATUS_ACTIVE || !promotion.activeUntil) {
            return errorRes(res, 409, 'Продлить можно только активное продвижение');
        }

        const nextUntil = new Date(
            promotion.activeUntil.getTime() + promotion.durationHours * 60 * 60 * 1000,
        );
        promotion.activeUntil = nextUntil;
        promotion.approvedByUserId = req.userId;
        await promotion.save();

        await setProductPromotionForProduct({
            productId: promotion.productId,
            activatedAt: promotion.activatedAt,
            activeUntil: nextUntil,
        });

        return successRes(res, {
            message: 'Продвижение продлено',
            promotion: toPromotionPayload(promotion.toObject()),
        });
    } catch (error) {
        console.error('extendProductPromotionByStaffController error:', error);
        return errorRes(res, 500, 'Ошибка при продлении продвижения');
    }
};
