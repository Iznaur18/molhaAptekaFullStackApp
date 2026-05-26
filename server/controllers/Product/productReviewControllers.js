import { PRODUCT_MODERATION_APPROVED } from '../../constants/productModerationConstants.js';
import {
    PRODUCT_REVIEW_LIMIT_DEFAULT,
    PRODUCT_REVIEW_LIMIT_MAX,
    PRODUCT_REVIEW_MESSAGES,
    PRODUCT_REVIEW_PAGE_DEFAULT,
    PRODUCT_REVIEW_STATUS_PUBLISHED,
} from '../../constants/productReviewConstants.js';
import { ProductModel, ProductReviewModel } from '../../models/index.js';
import {
    assertCanSubmitProductReview,
    buildProductReviewSummary,
    canAccessProductReviews,
    isReviewEditable,
    normalizeReviewRating,
    normalizeReviewText,
    recalculateProductReviewAggregates,
    serializeProductReview,
} from '../../utils/productReviewHelpers.js';
import { errorRes, successRes } from '../../utils/index.js';

const AUTHOR_PUBLIC_SELECT = '_id userName isUserDataConfirmed';

const parseListPagination = (query) => {
    const page = Math.max(
        PRODUCT_REVIEW_PAGE_DEFAULT,
        Number(query.page) || PRODUCT_REVIEW_PAGE_DEFAULT,
    );
    const limit = Math.min(
        PRODUCT_REVIEW_LIMIT_MAX,
        Math.max(1, Number(query.limit) || PRODUCT_REVIEW_LIMIT_DEFAULT),
    );
    return { page, limit, skip: (page - 1) * limit };
};

/**
 * `GET /product/:productId/reviews`
 */
export const listProductReviewsController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page, limit, skip } = parseListPagination(req.query);

        const product = await ProductModel.findById(productId)
            .select('productModerationStatus productSeller')
            .lean();

        if (!product) {
            return errorRes(res, 404, PRODUCT_REVIEW_MESSAGES.PRODUCT_NOT_FOUND);
        }

        const viewerUserId = req.userId ? String(req.userId) : null;
        if (!canAccessProductReviews(product, viewerUserId)) {
            return errorRes(res, 400, PRODUCT_REVIEW_MESSAGES.NOT_APPROVED);
        }

        const filter = {
            productId,
            status: PRODUCT_REVIEW_STATUS_PUBLISHED,
        };

        const [reviews, total] = await Promise.all([
            ProductReviewModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('authorUserId', AUTHOR_PUBLIC_SELECT)
                .lean(),
            ProductReviewModel.countDocuments(filter),
        ]);

        return successRes(res, {
            reviews: reviews.map((row) => serializeProductReview(row)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 0,
            },
        });
    } catch (error) {
        console.error('listProductReviewsController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке отзывов');
    }
};

/**
 * `GET /product/:productId/reviews/summary`
 */
export const getProductReviewSummaryController = async (req, res) => {
    try {
        const { productId } = req.params;
        const viewerUserId = req.userId ? String(req.userId) : null;

        const summary = await buildProductReviewSummary(viewerUserId, productId);
        return successRes(res, summary);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === PRODUCT_REVIEW_MESSAGES.PRODUCT_NOT_FOUND) {
                return errorRes(res, 404, error.message);
            }
        }
        console.error('getProductReviewSummaryController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке сводки отзывов');
    }
};

/**
 * `POST /product/:productId/reviews`
 */
export const submitProductReviewController = async (req, res) => {
    try {
        const authorUserId = String(req.userId);
        const { productId } = req.params;

        let rating;
        let text;
        try {
            rating = normalizeReviewRating(req.body?.rating);
            text = normalizeReviewText(req.body?.text);
        } catch (validationError) {
            return errorRes(
                res,
                400,
                validationError instanceof Error
                    ? validationError.message
                    : 'Некорректные данные отзыва',
            );
        }

        try {
            await assertCanSubmitProductReview(authorUserId, productId);
        } catch (e) {
            return errorRes(
                res,
                400,
                e instanceof Error ? e.message : 'Нельзя оставить отзыв',
            );
        }

        const existing = await ProductReviewModel.findOne({
            productId,
            authorUserId,
        }).lean();

        if (existing) {
            return errorRes(res, 409, PRODUCT_REVIEW_MESSAGES.ALREADY_EXISTS);
        }

        const review = await ProductReviewModel.create({
            productId,
            authorUserId,
            rating,
            text,
        });

        await recalculateProductReviewAggregates(productId);

        const populated = await ProductReviewModel.findById(review._id)
            .populate('authorUserId', AUTHOR_PUBLIC_SELECT)
            .lean();

        const aggregates = await ProductModel.findById(productId)
            .select('averageRating reviewCount')
            .lean();

        return successRes(res, {
            review: serializeProductReview(populated),
            averageRating: aggregates?.averageRating ?? 0,
            reviewCount: aggregates?.reviewCount ?? 0,
            message: 'Отзыв опубликован',
        });
    } catch (error) {
        if (error?.code === 11000) {
            return errorRes(res, 409, PRODUCT_REVIEW_MESSAGES.ALREADY_EXISTS);
        }
        console.error('submitProductReviewController error:', error);
        return errorRes(res, 500, 'Ошибка при публикации отзыва');
    }
};

/**
 * `PATCH /product/:productId/reviews/me`
 */
export const patchMyProductReviewController = async (req, res) => {
    try {
        const authorUserId = String(req.userId);
        const { productId } = req.params;

        const review = await ProductReviewModel.findOne({
            productId,
            authorUserId,
        });

        if (!review) {
            return errorRes(res, 404, PRODUCT_REVIEW_MESSAGES.REVIEW_NOT_FOUND);
        }

        if (!isReviewEditable(review)) {
            return errorRes(
                res,
                400,
                PRODUCT_REVIEW_MESSAGES.EDIT_WINDOW_EXPIRED,
            );
        }

        if (req.body?.rating != null) {
            try {
                review.rating = normalizeReviewRating(req.body.rating);
            } catch (validationError) {
                return errorRes(
                    res,
                    400,
                    validationError instanceof Error
                        ? validationError.message
                        : 'Некорректная оценка',
                );
            }
        }

        if (req.body?.text !== undefined) {
            try {
                review.text = normalizeReviewText(req.body.text);
            } catch (validationError) {
                return errorRes(
                    res,
                    400,
                    validationError instanceof Error
                        ? validationError.message
                        : 'Некорректный текст',
                );
            }
        }

        await review.save();
        await recalculateProductReviewAggregates(productId);

        const populated = await ProductReviewModel.findById(review._id)
            .populate('authorUserId', AUTHOR_PUBLIC_SELECT)
            .lean();

        const aggregates = await ProductModel.findById(productId)
            .select('averageRating reviewCount')
            .lean();

        return successRes(res, {
            review: serializeProductReview(populated),
            averageRating: aggregates?.averageRating ?? 0,
            reviewCount: aggregates?.reviewCount ?? 0,
            message: 'Отзыв обновлён',
        });
    } catch (error) {
        console.error('patchMyProductReviewController error:', error);
        return errorRes(res, 500, 'Ошибка при обновлении отзыва');
    }
};

/**
 * `DELETE /product/:productId/reviews/me`
 */
export const deleteMyProductReviewController = async (req, res) => {
    try {
        const authorUserId = String(req.userId);
        const { productId } = req.params;

        const review = await ProductReviewModel.findOne({
            productId,
            authorUserId,
        });

        if (!review) {
            return errorRes(res, 404, PRODUCT_REVIEW_MESSAGES.REVIEW_NOT_FOUND);
        }

        if (!isReviewEditable(review)) {
            return errorRes(
                res,
                400,
                PRODUCT_REVIEW_MESSAGES.EDIT_WINDOW_EXPIRED,
            );
        }

        await review.deleteOne();
        await recalculateProductReviewAggregates(productId);

        const aggregates = await ProductModel.findById(productId)
            .select('averageRating reviewCount')
            .lean();

        return successRes(res, {
            averageRating: aggregates?.averageRating ?? 0,
            reviewCount: aggregates?.reviewCount ?? 0,
            message: 'Отзыв удалён',
        });
    } catch (error) {
        console.error('deleteMyProductReviewController error:', error);
        return errorRes(res, 500, 'Ошибка при удалении отзыва');
    }
};
