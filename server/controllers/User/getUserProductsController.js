import { UserModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';
import { getOptionalViewerFromRequest } from '../../utils/optionalViewerFromRequest.js';
import { sanitizeUserProfileForViewer } from '../../utils/userProfileVisibility.js';
import {
    getSellerCatalogProductsPage,
    USER_SELLER_PRODUCTS_PAGE_SIZE_DEFAULT,
    USER_SELLER_PRODUCTS_PAGE_SIZE_MAX,
} from '../../utils/userSellerCatalogProducts.js';

const parsePageLimit = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(
        USER_SELLER_PRODUCTS_PAGE_SIZE_MAX,
        Math.max(1, Number(query.limit) || USER_SELLER_PRODUCTS_PAGE_SIZE_DEFAULT),
    );
    return { page, limit };
};

/** `GET /user/:userIdClient/products` — товары продавца в каталоге (JWT). */
export const getUserProductsController = async (req, res) => {
    try {
        if (!req.userId) {
            return errorRes(res, 401, 'Требуется авторизация');
        }

        const targetUserId = req.params.userIdClient;
        const targetUser = await UserModel.findById(targetUserId).lean();

        if (!targetUser) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        const viewer = await getOptionalViewerFromRequest(req);
        const publicUser = sanitizeUserProfileForViewer(targetUser, {
            viewer,
            viewerId: req.userId,
        });

        if (!publicUser) {
            return errorRes(res, 404, 'Пользователь не найден');
        }

        const { page, limit } = parsePageLimit(req.query);
        const payload = await getSellerCatalogProductsPage(targetUserId, page, limit);

        return successRes(res, payload);
    } catch (error) {
        console.error('getUserProductsController error:', error);
        return errorRes(res, 500, 'Ошибка при получении товаров пользователя');
    }
};
