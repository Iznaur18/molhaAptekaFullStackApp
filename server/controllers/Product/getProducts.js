import { ProductModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

export const getProductsController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1); // из клиента придет page=2 в URL.
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10)); // parseInt(limitParam, 10) — преобразует строку в число, 10 — основание системы счисления (десятичная система)
        const skip = (page - 1) * limit; // skip — количество продуктов, которые нужно пропустить

        const [products, total] = await Promise.all([ // Promise.all — это метод, который позволяет ожидать выполнения нескольких Promise-ов одновременно
            ProductModel.find()
                .populate('productSeller', 'userName email userPhoneNumber _id userRatingByVotes')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ProductModel.countDocuments(), // countDocuments — это метод, который позволяет посчитать количество документов в коллекции
        ]);

        const pagination = { 
            page: page,
            limit: limit,
            total: total,
            totalPages: Math.ceil(total / limit),
        }; // pagination — объект с информацией о пагинации

        return successRes(res, { products, pagination }); // отправляем клиенту данные о продуктах и информацию о пагинации
        // GET /product?page=2&limit=10 — вернёт вторую страницу по 10 товаров и метаданные пагинации.
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении продуктов');
    }
};

export const getMyProductsController = async (req, res) => {
    try {
        const userId = req.userId;
        const products = await ProductModel.find({ productSeller: userId });
        return successRes(res, { products });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении своих продуктов');
    }
};