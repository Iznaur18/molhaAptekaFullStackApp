import { ProductModel } from '../../models/index.js';
import { PRODUCT_MODERATION_APPROVED } from '../../constants/productModerationConstants.js';
import { isUserAdmin } from '../../utils/adminUserGuard.js';
import {
    hasProductOpenSales,
    OPEN_SALES_BLOCK_MESSAGE,
} from '../../utils/productOrderLocks.js';
import { errorRes, successRes } from '../../utils/index.js';

/** Удаление своего товара или любого (admin). DELETE /product/:productId */
export const deleteMyProductController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;
        const isAdmin = await isUserAdmin(userId);

        if (await hasProductOpenSales(productId)) {
            return errorRes(res, 409, OPEN_SALES_BLOCK_MESSAGE);
        }

        const ownerFilter = isAdmin
            ? { _id: productId }
            : {
                  _id: productId,
                  productSeller: userId,
                  productModerationStatus: PRODUCT_MODERATION_APPROVED,
              };

        const deleted = await ProductModel.findOneAndDelete(ownerFilter).lean();

        if (!deleted) {
            if (!isAdmin) {
                const owned = await ProductModel.findOne({
                    _id: productId,
                    productSeller: userId,
                })
                    .select('productModerationStatus')
                    .lean();
                if (
                    owned &&
                    owned.productModerationStatus !== PRODUCT_MODERATION_APPROVED
                ) {
                    return errorRes(
                        res,
                        409,
                        'Удалить можно только одобренный товар',
                    );
                }
            }
            return errorRes(res, 404, 'Товар не найден или нет прав на удаление');
        }

        return successRes(res, { message: 'Товар удалён' });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при удалении товара');
    }
};
