import { ProductModel } from '../../models/index.js';
import {
    PRODUCT_MODERATION_APPROVED,
    PRODUCT_MODERATION_PENDING,
    PRODUCT_MODERATION_REJECTED,
} from '../../constants/productModerationConstants.js';
import { PRODUCT_SELLER_PUBLIC_SELECT } from '../../constants/productSellerPublicFields.js';
import {
    attachProductSellerSnapshot,
    attachProductSellerSnapshots,
} from '../../utils/attachProductSellerSnapshots.js';
import { isUserAdmin } from '../../utils/adminUserGuard.js';
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

/** `GET /product/moderation/pending` — очередь на модерацию (FIFO). */
export const getPendingModerationProductsController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);

        const filter = { productModerationStatus: PRODUCT_MODERATION_PENDING };

        const [products, total] = await Promise.all([
            ProductModel.find(filter)
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit)
                .populate('productSeller', PRODUCT_SELLER_PUBLIC_SELECT)
                .lean(),
            ProductModel.countDocuments(filter),
        ]);

        const productsWithSeller = await attachProductSellerSnapshots(products);

        return successRes(res, {
            products: productsWithSeller,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        });
    } catch (error) {
        console.error('getPendingModerationProductsController error:', error);
        return errorRes(res, 500, 'Ошибка при получении очереди модерации');
    }
};

/** `PATCH /product/:productId/moderation/approve` */
export const approveProductModerationController = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await ProductModel.findById(productId);
        if (!product) {
            return errorRes(res, 404, 'Товар не найден');
        }
        if (product.productModerationStatus !== PRODUCT_MODERATION_PENDING) {
            return errorRes(res, 409, 'Товар не ожидает модерации');
        }

        product.productModerationStatus = PRODUCT_MODERATION_APPROVED;
        product.productModerationComment = '';
        product.productIsAvailable = true;
        await product.save();
        await product.populate('productSeller', PRODUCT_SELLER_PUBLIC_SELECT);

        const enriched = await attachProductSellerSnapshot(product.toObject());

        return successRes(res, {
            message: 'Товар одобрен и опубликован в каталоге',
            product: enriched,
        });
    } catch (error) {
        console.error('approveProductModerationController error:', error);
        return errorRes(res, 500, 'Ошибка при одобрении товара');
    }
};

/** `PATCH /product/:productId/moderation/reject` */
export const rejectProductModerationController = async (req, res) => {
    try {
        const { productId } = req.params;
        const commentRaw = req.body?.productModerationComment;
        const comment =
            commentRaw == null ? '' : String(commentRaw).trim().slice(0, 2000);

        const product = await ProductModel.findById(productId);
        if (!product) {
            return errorRes(res, 404, 'Товар не найден');
        }
        if (product.productModerationStatus !== PRODUCT_MODERATION_PENDING) {
            return errorRes(res, 409, 'Товар не ожидает модерации');
        }

        product.productModerationStatus = PRODUCT_MODERATION_REJECTED;
        product.productModerationComment = comment;
        product.productIsAvailable = false;
        await product.save();
        await product.populate('productSeller', PRODUCT_SELLER_PUBLIC_SELECT);

        const enriched = await attachProductSellerSnapshot(product.toObject());

        return successRes(res, {
            message: 'Товар отклонён',
            product: enriched,
        });
    } catch (error) {
        console.error('rejectProductModerationController error:', error);
        return errorRes(res, 500, 'Ошибка при отклонении товара');
    }
};
