import mongoose from 'mongoose';

import {
    INSTALLMENT_HAS_CONTRACTS_BLOCK_MESSAGE,
    INSTALLMENT_MODERATION_APPROVED,
    INSTALLMENT_MODERATION_PENDING,
    INSTALLMENT_MODERATION_REJECTED,
    INSTALLMENT_PROGRAM_NOT_AVAILABLE_MESSAGE,
    IN_APP_NOTIFICATION_KIND_INSTALLMENT_SELLER_MESSAGE,
} from '../../constants/installmentConstants.js';
import { PRODUCT_MODERATION_APPROVED } from '../../constants/productModerationConstants.js';
import {
    InstallmentContractModel,
    ProductInstallmentProgramModel,
    ProductModel,
} from '../../models/index.js';
import { isUserAdmin, isUserStaff } from '../../utils/adminUserGuard.js';
import { assertUserCanManageInstallmentAsSeller } from '../../utils/installmentAccess.js';
import {
    countActiveInstallmentContractsForProduct,
    normalizeInstallmentPlansInput,
    syncProductInstallmentEnabledFlag,
    toInstallmentProgramPayload,
} from '../../utils/installmentHelpers.js';
import { createUserInAppNotification } from '../../utils/userInAppNotifications.js';
import { errorRes, successRes } from '../../utils/index.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
    return { page, limit, skip: (page - 1) * limit };
};

/** `GET /product/:productId/installment-program` */
export const getProductInstallmentProgramController = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.userId;
        const program = await ProductInstallmentProgramModel.findOne({ productId }).lean();

        if (!program) {
            return successRes(res, { program: null });
        }

        const product = await ProductModel.findById(productId)
            .select('productSeller')
            .lean();
        const isOwner =
            userId != null &&
            String(product?.productSeller) === String(userId);
        const isStaff = await isUserStaff(userId);

        if (
            !isOwner &&
            !isStaff &&
            (program.moderationStatus !== INSTALLMENT_MODERATION_APPROVED ||
                !program.isEnabled)
        ) {
            return successRes(res, { program: null });
        }

        return successRes(res, { program: toInstallmentProgramPayload(program) });
    } catch (error) {
        console.error('getProductInstallmentProgramController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке рассрочки');
    }
};

/** `PUT /product/:productId/installment-program` */
export const upsertProductInstallmentProgramController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;
        const { isEnabled } = req.body;

        try {
            await assertUserCanManageInstallmentAsSeller(userId);
        } catch (e) {
            return errorRes(
                res,
                403,
                e instanceof Error ? e.message : 'Нет прав',
            );
        }

        const product = await ProductModel.findOne({
            _id: productId,
            productSeller: userId,
            productModerationStatus: PRODUCT_MODERATION_APPROVED,
        }).lean();

        if (!product) {
            return errorRes(res, 404, 'Товар не найден или недоступен');
        }

        const activeContracts = await countActiveInstallmentContractsForProduct(
            productId,
        );
        if (activeContracts > 0) {
            return errorRes(res, 409, INSTALLMENT_HAS_CONTRACTS_BLOCK_MESSAGE);
        }

        let plans;
        try {
            plans = normalizeInstallmentPlansInput(req.body.plans);
        } catch (e) {
            return errorRes(
                res,
                400,
                e instanceof Error ? e.message : 'Некорректные планы',
            );
        }

        const existing = await ProductInstallmentProgramModel.findOne({
            productId,
        });

        if (existing) {
            existing.isEnabled = Boolean(isEnabled);
            existing.plans = plans;
            if (isEnabled && existing.wasEverApproved !== true) {
                existing.moderationStatus = INSTALLMENT_MODERATION_PENDING;
            }
            await existing.save();
            await syncProductInstallmentEnabledFlag(productId);
            return successRes(res, {
                message:
                    isEnabled && existing.wasEverApproved !== true
                        ? 'Программа рассрочки отправлена на модерацию'
                        : 'Программа рассрочки обновлена',
                program: toInstallmentProgramPayload(existing.toObject()),
            });
        }

        const created = await ProductInstallmentProgramModel.create({
            productId,
            sellerId: userId,
            isEnabled: Boolean(isEnabled),
            moderationStatus: isEnabled
                ? INSTALLMENT_MODERATION_PENDING
                : INSTALLMENT_MODERATION_REJECTED,
            plans,
        });

        await syncProductInstallmentEnabledFlag(productId);

        return successRes(res, {
            message: isEnabled
                ? 'Программа рассрочки отправлена на модерацию'
                : 'Программа рассрочки сохранена',
            program: toInstallmentProgramPayload(created.toObject()),
        });
    } catch (error) {
        console.error('upsertProductInstallmentProgramController error:', error);
        return errorRes(res, 500, 'Ошибка при сохранении рассрочки');
    }
};

/** `GET /product/installment/moderation/pending` */
export const getPendingInstallmentModerationController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const filter = {
            isEnabled: true,
            moderationStatus: INSTALLMENT_MODERATION_PENDING,
        };
        const [rows, total] = await Promise.all([
            ProductInstallmentProgramModel.find(filter)
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ProductInstallmentProgramModel.countDocuments(filter),
        ]);

        const productIds = rows.map((row) => row.productId);
        const products = await ProductModel.find({ _id: { $in: productIds } })
            .select('productName productSeller')
            .lean();
        const productById = Object.fromEntries(
            products.map((product) => [String(product._id), product]),
        );

        return successRes(res, {
            programs: rows.map((row) => ({
                ...toInstallmentProgramPayload(row),
                productName:
                    productById[String(row.productId)]?.productName ?? null,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('getPendingInstallmentModerationController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке очереди');
    }
};

/** `GET /product/installment/moderation/pending/count` */
export const getPendingInstallmentModerationCountController = async (req, res) => {
    try {
        const count = await ProductInstallmentProgramModel.countDocuments({
            isEnabled: true,
            moderationStatus: INSTALLMENT_MODERATION_PENDING,
        });
        return successRes(res, { count });
    } catch (error) {
        console.error('getPendingInstallmentModerationCountController error:', error);
        return errorRes(res, 500, 'Ошибка');
    }
};

/** `PATCH /product/:productId/installment/moderation/approve` */
export const approveInstallmentModerationController = async (req, res) => {
    try {
        const { productId } = req.params;
        const staffId = req.userId;
        const program = await ProductInstallmentProgramModel.findOne({ productId });
        if (!program) {
            return errorRes(res, 404, 'Программа не найдена');
        }
        if (program.moderationStatus !== INSTALLMENT_MODERATION_PENDING) {
            return errorRes(res, 409, 'Программа не на модерации');
        }

        program.moderationStatus = INSTALLMENT_MODERATION_APPROVED;
        program.moderationComment = '';
        program.reviewedBy = staffId;
        program.reviewedAt = new Date();
        program.wasEverApproved = true;
        await program.save();
        await syncProductInstallmentEnabledFlag(productId);

        return successRes(res, {
            message: 'Рассрочка одобрена',
            program: toInstallmentProgramPayload(program.toObject()),
        });
    } catch (error) {
        console.error('approveInstallmentModerationController error:', error);
        return errorRes(res, 500, 'Ошибка при одобрении');
    }
};

/** `PATCH /product/:productId/installment/moderation/reject` */
export const rejectInstallmentModerationController = async (req, res) => {
    try {
        const { productId } = req.params;
        const staffId = req.userId;
        const comment = String(req.body?.moderationComment ?? '').trim();
        const program = await ProductInstallmentProgramModel.findOne({ productId });
        if (!program) {
            return errorRes(res, 404, 'Программа не найдена');
        }
        if (program.moderationStatus !== INSTALLMENT_MODERATION_PENDING) {
            return errorRes(res, 409, 'Программа не на модерации');
        }

        program.moderationStatus = INSTALLMENT_MODERATION_REJECTED;
        program.moderationComment = comment;
        program.reviewedBy = staffId;
        program.reviewedAt = new Date();
        await program.save();
        await syncProductInstallmentEnabledFlag(productId);

        return successRes(res, {
            message: 'Рассрочка отклонена',
            program: toInstallmentProgramPayload(program.toObject()),
        });
    } catch (error) {
        console.error('rejectInstallmentModerationController error:', error);
        return errorRes(res, 500, 'Ошибка при отклонении');
    }
};

export { INSTALLMENT_PROGRAM_NOT_AVAILABLE_MESSAGE };
