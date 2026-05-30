import { ProductModel, ProductReportModel } from '../../models/index.js';
import { PRODUCT_MODERATION_APPROVED } from '../../constants/productModerationConstants.js';
import {
    PRODUCT_REPORT_ALREADY_MESSAGE,
    PRODUCT_REPORT_STATUS_PENDING,
    PRODUCT_REPORT_TEXT_MAX_CHARS,
} from '../../constants/productReportConstants.js';
import {
    dismissPendingReportsForProduct,
    getPendingProductReportGroups,
    notifySellerAboutProductReport,
    resolvePendingReportsForProduct,
} from '../../utils/productReportHelpers.js';
import { errorRes, successRes } from '../../utils/index.js';

/**
 * `POST /product/:productId/report`
 */
export const submitProductReportController = async (req, res) => {
    try {
        const reporterId = String(req.userId);
        const { productId } = req.params;
        const reportText = String(req.body?.reportText ?? '').trim();

        if (reportText.length === 0) {
            return errorRes(res, 400, 'Укажите текст жалобы');
        }

        if (reportText.length > PRODUCT_REPORT_TEXT_MAX_CHARS) {
            return errorRes(
                res,
                400,
                `Текст жалобы: не больше ${PRODUCT_REPORT_TEXT_MAX_CHARS} символов`,
            );
        }

        const product = await ProductModel.findById(productId)
            .select('productSeller productModerationStatus')
            .lean();

        if (!product) {
            return errorRes(res, 404, 'Товар не найден');
        }

        if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
            return errorRes(res, 400, 'Жалоба доступна только на одобренные товары');
        }

        const sellerId = String(product.productSeller);
        if (sellerId === reporterId) {
            return errorRes(res, 400, 'Нельзя пожаловаться на свой товар');
        }

        const existingPending = await ProductReportModel.findOne({
            productId,
            reporterUserId: reporterId,
            status: PRODUCT_REPORT_STATUS_PENDING,
        }).lean();

        if (existingPending) {
            return errorRes(res, 409, PRODUCT_REPORT_ALREADY_MESSAGE);
        }

        await ProductReportModel.create({
            productId,
            reporterUserId: reporterId,
            reportText,
        });

        await notifySellerAboutProductReport(sellerId, productId);

        return successRes(res, { message: 'Жалоба принята' });
    } catch (error) {
        if (error?.code === 11000) {
            return errorRes(res, 409, PRODUCT_REPORT_ALREADY_MESSAGE);
        }
        console.error('submitProductReportController error:', error);
        return errorRes(res, 500, 'Ошибка при отправке жалобы');
    }
};

/**
 * `GET /product/:productId/report/me`
 */
export const getMyProductReportStatusController = async (req, res) => {
    try {
        const reporterId = String(req.userId);
        const { productId } = req.params;

        const pending = await ProductReportModel.findOne({
            productId,
            reporterUserId: reporterId,
            status: PRODUCT_REPORT_STATUS_PENDING,
        })
            .select('_id')
            .lean();

        return successRes(res, {
            hasPendingReport: Boolean(pending),
        });
    } catch (error) {
        console.error('getMyProductReportStatusController error:', error);
        return errorRes(res, 500, 'Ошибка при проверке жалобы');
    }
};

/** `GET /product/reports/pending */
export const getPendingProductReportsController = async (req, res) => {
    try {
        const { groups, totalReports } = await getPendingProductReportGroups();

        return successRes(res, {
            groups,
            totalReports,
            totalGroups: groups.length,
        });
    } catch (error) {
        console.error('getPendingProductReportsController error:', error);
        return errorRes(res, 500, 'Ошибка при получении жалоб');
    }
};

/** `GET /product/reports/pending/count */
export const getPendingProductReportsCountController = async (req, res) => {
    try {
        const totalReports = await ProductReportModel.countDocuments({
            status: PRODUCT_REPORT_STATUS_PENDING,
        });

        return successRes(res, { totalReports });
    } catch (error) {
        console.error('getPendingProductReportsCountController error:', error);
        return errorRes(res, 500, 'Ошибка при получении счётчика жалоб');
    }
};

/** `PATCH /product/reports/product/:productId/resolve */
export const resolveProductReportsForProductController = async (req, res) => {
    try {
        const staffUserId = req.userId;
        const { productId } = req.params;
        const resolution = String(req.body?.resolution ?? '').trim();
        const staffNote = String(req.body?.staffNote ?? '').trim();

        if (staffNote.length === 0) {
            return errorRes(res, 400, 'Комментарий staff обязателен');
        }

        try {
            const result = await resolvePendingReportsForProduct(
                productId,
                staffUserId,
                staffNote,
                resolution,
            );

            return successRes(res, {
                message: 'Жалобы по товару обработаны',
                resolvedCount: result.resolvedCount,
            });
        } catch (resolveError) {
            if (resolveError instanceof Error) {
                if (resolveError.message === 'PRODUCT_NOT_FOUND') {
                    return errorRes(res, 404, 'Товар не найден');
                }
                if (resolveError.message === 'NO_PENDING_REPORTS') {
                    return errorRes(res, 409, 'Нет необработанных жалоб по этому товару');
                }
                if (resolveError.message === 'INVALID_RESOLUTION') {
                    return errorRes(res, 400, 'Недопустимое действие');
                }
            }
            throw resolveError;
        }
    } catch (error) {
        console.error('resolveProductReportsForProductController error:', error);
        return errorRes(res, 500, 'Ошибка при обработке жалоб');
    }
};
