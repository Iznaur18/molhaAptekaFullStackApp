import { ProductModel, RaffleModel, UserModel } from '../../models/index.js';
import {
    RAFFLE_STATUS_ACTIVE,
    RAFFLE_STATUS_COMPLETED,
    RAFFLE_STATUS_PAUSED,
    RAFFLE_STATUS_PENDING_STAFF,
    RAFFLE_STATUS_REJECTED,
} from '../../constants/raffleConstants.js';
import { PRODUCT_MODERATION_APPROVED } from '../../constants/productModerationConstants.js';
import { buildRegexSearchOr, errorRes, successRes } from '../../utils/index.js';
import {
    countProducts,
    findProductsPage,
} from '../../utils/productCatalogQuery.js';
import { PRODUCT_SORT_NEWEST } from '../../constants/productCatalogSort.js';
import { attachProductSellerSnapshots } from '../../utils/attachProductSellerSnapshots.js';
import {
    assertSiteActiveRafflesWithinLimit,
    getFeaturedSiteRaffles,
    assertProductCanJoinRaffle,
    applyRafflePrizeImageFields,
    assertSellerCanCreateRaffle,
    clearRaffleParticipationFromProducts,
    getSellerActiveRaffle,
    recalculateRaffleSalesProgress,
    toPublicRafflePayload,
} from '../../utils/raffleHelpers.js';
import { normalizeRafflePrizeImageFocus } from '../../utils/profileImageFocus.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const loadRaffleSeller = async (sellerId) =>
    UserModel.findById(sellerId).select('userName').lean();

const mapVitrineRaffles = async (rows) =>
    Promise.all(
        rows.map(async (raffle) => {
            const seller = await loadRaffleSeller(raffle.sellerId);
            return toPublicRafflePayload(raffle, {
                includeInstagram: raffle.status === RAFFLE_STATUS_COMPLETED,
                seller,
            });
        }),
    );

export const getFeaturedRaffleController = async (req, res) => {
    try {
        const rows = await getFeaturedSiteRaffles();
        const raffles = await mapVitrineRaffles(rows);

        return successRes(res, {
            raffles,
            raffle: raffles[0] ?? null,
        });
    } catch (error) {
        console.error('getFeaturedRaffleController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке розыгрышей');
    }
};

export const getRaffleByIdController = async (req, res) => {
    try {
        const raffle = await RaffleModel.findById(req.params.raffleId).lean();
        if (!raffle) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }

        const publicStatuses = [
            RAFFLE_STATUS_ACTIVE,
            RAFFLE_STATUS_COMPLETED,
            RAFFLE_STATUS_PAUSED,
        ];
        const isOwner =
            req.userId && String(raffle.sellerId) === String(req.userId);

        if (!publicStatuses.includes(raffle.status) && !isOwner) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }

        const seller = await loadRaffleSeller(raffle.sellerId);

        return successRes(res, {
            raffle: toPublicRafflePayload(raffle, {
                includeInstagram: raffle.status === RAFFLE_STATUS_COMPLETED,
                includePrivateFields: isOwner,
                seller,
            }),
        });
    } catch (error) {
        console.error('getRaffleByIdController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке розыгрыша');
    }
};

export const getRaffleProductsController = async (req, res) => {
    try {
        const raffle = await RaffleModel.findById(req.params.raffleId).lean();
        if (!raffle) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }

        const allowedStatuses = [
            RAFFLE_STATUS_ACTIVE,
            RAFFLE_STATUS_COMPLETED,
        ];
        if (!allowedStatuses.includes(raffle.status)) {
            return errorRes(res, 404, 'Розыгрыш недоступен');
        }

        const { page, limit, skip } = parsePagination(req.query);
        const baseQuery = {
            activeRaffleId: raffle._id,
            raffleParticipationEnabledAt: { $ne: null },
            productModerationStatus: PRODUCT_MODERATION_APPROVED,
            productIsAvailable: { $ne: false },
        };
        const searchCondition = buildRegexSearchOr(req.query.search, ['productName']);
        const productsQuery = searchCondition
            ? { ...baseQuery, ...searchCondition }
            : baseQuery;

        const [products, total] = await Promise.all([
            findProductsPage(productsQuery, PRODUCT_SORT_NEWEST, skip, limit),
            countProducts(productsQuery),
        ]);

        return successRes(res, {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 0,
            },
        });
    } catch (error) {
        console.error('getRaffleProductsController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке товаров розыгрыша');
    }
};

export const createRaffleController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const access = await assertSellerCanCreateRaffle(sellerId);
        if (!access.ok) {
            return errorRes(res, 403, access.message);
        }

        const raffle = await RaffleModel.create({
            sellerId,
            title: String(req.body.title).trim(),
            description: String(req.body.description ?? '').trim(),
            prizeImageUrl: String(req.body.prizeImageUrl).trim(),
            prizeImageFocus: normalizeRafflePrizeImageFocus(req.body.prizeImageFocus),
            targetSales: Number(req.body.targetSales),
            instagramUrl: String(req.body.instagramUrl).trim(),
            status: RAFFLE_STATUS_PENDING_STAFF,
        });

        return successRes(
            res,
            {
                message: 'Розыгрыш отправлен на модерацию',
                raffle: toPublicRafflePayload(raffle.toObject()),
            },
            201,
        );
    } catch (error) {
        console.error('createRaffleController error:', error);
        return errorRes(res, 500, 'Ошибка при создании розыгрыша');
    }
};

export const getMyRaffleController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const [current, archive] = await Promise.all([
            getSellerActiveRaffle(sellerId),
            RaffleModel.find({
                sellerId,
                status: {
                    $in: [
                        RAFFLE_STATUS_COMPLETED,
                        RAFFLE_STATUS_REJECTED,
                        RAFFLE_STATUS_PAUSED,
                    ],
                },
            })
                .sort({ updatedAt: -1 })
                .limit(20)
                .lean(),
        ]);

        return successRes(res, {
            raffle: current
                ? toPublicRafflePayload(current, { includePrivateFields: true })
                : null,
            archive: archive.map((row) =>
                toPublicRafflePayload(row, {
                    includeInstagram: row.status === RAFFLE_STATUS_COMPLETED,
                    includePrivateFields: true,
                }),
            ),
        });
    } catch (error) {
        console.error('getMyRaffleController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке розыгрыша');
    }
};

export const patchMyRaffleController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const raffle = await RaffleModel.findById(req.params.raffleId);
        if (!raffle) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }
        if (String(raffle.sellerId) !== sellerId) {
            return errorRes(res, 403, 'Нет доступа');
        }
        if (raffle.status === RAFFLE_STATUS_COMPLETED) {
            return errorRes(res, 409, 'Завершённый розыгрыш нельзя редактировать');
        }
        if (raffle.status === RAFFLE_STATUS_REJECTED) {
            return errorRes(res, 409, 'Отклонённый розыгрыш нельзя редактировать');
        }

        if (req.body.title !== undefined) {
            raffle.title = String(req.body.title).trim();
        }
        if (req.body.description !== undefined) {
            raffle.description = String(req.body.description ?? '').trim();
        }
        applyRafflePrizeImageFields(raffle, req.body);
        if (req.body.targetSales !== undefined) {
            raffle.targetSales = Number(req.body.targetSales);
        }
        if (req.body.instagramUrl !== undefined) {
            raffle.instagramUrl = String(req.body.instagramUrl).trim();
        }

        if (raffle.status === RAFFLE_STATUS_PENDING_STAFF) {
            await raffle.save();
            return successRes(res, {
                raffle: toPublicRafflePayload(raffle.toObject(), {
                    includePrivateFields: true,
                }),
            });
        }

        if (raffle.status === RAFFLE_STATUS_ACTIVE) {
            await raffle.save();
            await recalculateRaffleSalesProgress(raffle._id);
            const fresh = await RaffleModel.findById(raffle._id).lean();
            return successRes(res, {
                raffle: toPublicRafflePayload(fresh, { includePrivateFields: true }),
            });
        }

        if (raffle.status === RAFFLE_STATUS_PAUSED) {
            await raffle.save();
            return successRes(res, {
                raffle: toPublicRafflePayload(raffle.toObject(), {
                    includePrivateFields: true,
                }),
            });
        }

        return errorRes(res, 409, 'Розыгрыш нельзя редактировать в текущем статусе');
    } catch (error) {
        console.error('patchMyRaffleController error:', error);
        return errorRes(res, 500, 'Ошибка при сохранении розыгрыша');
    }
};

export const patchRaffleByStaffController = async (req, res) => {
    try {
        const raffle = await RaffleModel.findById(req.params.raffleId);
        if (!raffle) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }

        if (req.body.title !== undefined) {
            raffle.title = String(req.body.title).trim();
        }
        if (req.body.description !== undefined) {
            raffle.description = String(req.body.description ?? '').trim();
        }
        applyRafflePrizeImageFields(raffle, req.body);
        if (req.body.targetSales !== undefined) {
            raffle.targetSales = Number(req.body.targetSales);
        }
        if (req.body.instagramUrl !== undefined) {
            raffle.instagramUrl = String(req.body.instagramUrl).trim();
        }

        await raffle.save();

        if (raffle.status === RAFFLE_STATUS_ACTIVE) {
            await recalculateRaffleSalesProgress(raffle._id);
        }

        const fresh = await RaffleModel.findById(raffle._id).lean();
        return successRes(res, {
            raffle: toPublicRafflePayload(fresh, { includePrivateFields: true }),
        });
    } catch (error) {
        console.error('patchRaffleByStaffController error:', error);
        return errorRes(res, 500, 'Ошибка при сохранении розыгрыша');
    }
};

export const deleteMyRaffleController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const raffle = await RaffleModel.findById(req.params.raffleId);
        if (!raffle) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }
        if (String(raffle.sellerId) !== sellerId) {
            return errorRes(res, 403, 'Нет доступа');
        }

        await clearRaffleParticipationFromProducts(raffle._id);
        await RaffleModel.deleteOne({ _id: raffle._id });

        return successRes(res, { message: 'Розыгрыш удалён' });
    } catch (error) {
        console.error('deleteMyRaffleController error:', error);
        return errorRes(res, 500, 'Ошибка при удалении розыгрыша');
    }
};

export const deleteRaffleByStaffController = async (req, res) => {
    try {
        const raffle = await RaffleModel.findById(req.params.raffleId);
        if (!raffle) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }

        await clearRaffleParticipationFromProducts(raffle._id);
        await RaffleModel.deleteOne({ _id: raffle._id });

        return successRes(res, { message: 'Розыгрыш удалён' });
    } catch (error) {
        console.error('deleteRaffleByStaffController error:', error);
        return errorRes(res, 500, 'Ошибка при удалении розыгрыша');
    }
};

export const pauseMyRaffleController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const raffle = await RaffleModel.findById(req.params.raffleId);
        if (!raffle) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }
        if (String(raffle.sellerId) !== sellerId) {
            return errorRes(res, 403, 'Нет доступа');
        }
        if (raffle.status !== RAFFLE_STATUS_ACTIVE) {
            return errorRes(res, 409, 'Снять с витрины можно только активный розыгрыш');
        }

        raffle.status = RAFFLE_STATUS_PAUSED;
        raffle.pausedAt = new Date();
        await raffle.save();
        await clearRaffleParticipationFromProducts(raffle._id);

        return successRes(res, {
            message: 'Розыгрыш снят с витрины',
            raffle: toPublicRafflePayload(raffle.toObject(), {
                includePrivateFields: true,
            }),
        });
    } catch (error) {
        console.error('pauseMyRaffleController error:', error);
        return errorRes(res, 500, 'Ошибка при снятии розыгрыша');
    }
};

export const setProductRaffleParticipationController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const enabled = req.body.enabled === true;
        const { productId } = req.params;

        if (!enabled) {
            const product = await ProductModel.findById(productId);
            if (!product) {
                return errorRes(res, 404, 'Товар не найден');
            }
            if (String(product.productSeller) !== sellerId) {
                return errorRes(res, 403, 'Нет доступа');
            }
            const previousRaffleId = product.activeRaffleId;
            product.activeRaffleId = null;
            product.raffleParticipationEnabledAt = null;
            await product.save();
            if (previousRaffleId) {
                await recalculateRaffleSalesProgress(previousRaffleId);
            }
            const [payload] = await attachProductSellerSnapshots([
                product.toObject(),
            ]);
            return successRes(res, { product: payload });
        }

        const check = await assertProductCanJoinRaffle(productId, sellerId);
        if (!check.ok) {
            return errorRes(res, 409, check.message);
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return errorRes(res, 404, 'Товар не найден');
        }

        product.activeRaffleId = check.raffle._id;
        product.raffleParticipationEnabledAt = new Date();
        await product.save();
        await recalculateRaffleSalesProgress(check.raffle._id);

        const [payload] = await attachProductSellerSnapshots([product.toObject()]);
        return successRes(res, { product: payload });
    } catch (error) {
        console.error('setProductRaffleParticipationController error:', error);
        return errorRes(res, 500, 'Ошибка при обновлении участия товара');
    }
};

export const getPendingRafflesController = async (req, res) => {
    try {
        const rows = await RaffleModel.find({ status: RAFFLE_STATUS_PENDING_STAFF })
            .sort({ createdAt: 1 })
            .limit(100)
            .lean();

        const sellerIds = [...new Set(rows.map((row) => String(row.sellerId)))];
        const sellers = await UserModel.find({ _id: { $in: sellerIds } })
            .select('userName')
            .lean();
        const sellerById = Object.fromEntries(
            sellers.map((seller) => [String(seller._id), seller]),
        );

        return successRes(res, {
            raffles: rows.map((row) =>
                toPublicRafflePayload(row, {
                    seller: sellerById[String(row.sellerId)] ?? null,
                    includePrivateFields: true,
                }),
            ),
        });
    } catch (error) {
        console.error('getPendingRafflesController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке очереди розыгрышей');
    }
};

export const getPendingRafflesCountController = async (req, res) => {
    try {
        const count = await RaffleModel.countDocuments({
            status: RAFFLE_STATUS_PENDING_STAFF,
        });
        return successRes(res, { count });
    } catch (error) {
        console.error('getPendingRafflesCountController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке счётчика');
    }
};

export const approveRaffleController = async (req, res) => {
    try {
        const staffId = String(req.userId);
        const raffle = await RaffleModel.findById(req.params.raffleId);
        if (!raffle) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }
        if (raffle.status !== RAFFLE_STATUS_PENDING_STAFF) {
            return errorRes(res, 409, 'Розыгрыш уже обработан');
        }

        const globalCheck = await assertSiteActiveRafflesWithinLimit(raffle._id);
        if (!globalCheck.ok) {
            return errorRes(res, 409, globalCheck.message);
        }

        raffle.status = RAFFLE_STATUS_ACTIVE;
        raffle.approvedByUserId = staffId;
        raffle.approvedAt = new Date();
        raffle.moderationComment = '';
        await raffle.save();

        return successRes(res, {
            message: 'Розыгрыш одобрен',
            raffle: toPublicRafflePayload(raffle.toObject()),
        });
    } catch (error) {
        console.error('approveRaffleController error:', error);
        return errorRes(res, 500, 'Ошибка при одобрении розыгрыша');
    }
};

export const rejectRaffleController = async (req, res) => {
    try {
        const raffle = await RaffleModel.findById(req.params.raffleId);
        if (!raffle) {
            return errorRes(res, 404, 'Розыгрыш не найден');
        }
        if (raffle.status !== RAFFLE_STATUS_PENDING_STAFF) {
            return errorRes(res, 409, 'Розыгрыш уже обработан');
        }

        raffle.status = RAFFLE_STATUS_REJECTED;
        raffle.rejectedAt = new Date();
        raffle.moderationComment = String(req.body?.comment ?? '').trim();
        await raffle.save();
        await clearRaffleParticipationFromProducts(raffle._id);

        return successRes(res, {
            message: 'Розыгрыш отклонён',
            raffle: toPublicRafflePayload(raffle.toObject(), {
                includePrivateFields: true,
            }),
        });
    } catch (error) {
        console.error('rejectRaffleController error:', error);
        return errorRes(res, 500, 'Ошибка при отклонении розыгрыша');
    }
};
