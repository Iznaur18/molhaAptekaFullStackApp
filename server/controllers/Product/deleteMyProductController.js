import { ProductModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

/** Удаление своего товара. DELETE /product/:productId (JWT = продавец) */
export const deleteMyProductController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        const deleted = await ProductModel.findOneAndDelete({
            _id: productId,
            productSeller: userId,
        }).lean();

        if (!deleted) {
            return errorRes(res, 404, 'Товар не найден или нет прав на удаление');
        }

        return successRes(res, { message: 'Товар удалён' });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при удалении товара');
    }
};
