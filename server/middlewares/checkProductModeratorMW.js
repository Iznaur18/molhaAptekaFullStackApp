import { UserModel } from '../models/index.js';
import { canModerateProductsRole } from '../utils/productModeration.js';
import { errorRes } from '../utils/index.js';

/**
 * Требует роль admin или moderator. После `checkAuthMW`.
 */
export const checkProductModeratorMW = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.userId).select('userRole').lean();

        if (!user) {
            return errorRes(res, 401, 'Пользователь не найден');
        }
        if (!canModerateProductsRole(user.userRole)) {
            return errorRes(res, 403, 'Доступ только для модерации товаров');
        }

        req.userRole = user.userRole;
        return next();
    } catch (error) {
        return next(error);
    }
};
