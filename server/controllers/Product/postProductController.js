import { ProductModel, UserModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

export const postProductController = async (req, res) => {
    try {
        const userId = req.userId; // id пользователя который продает продукт найденный по userId из JWT
        const { productName, productDescription, productPrice, productCategory, productIsAvailable } = req.body; // извлекаем данные из тела запроса

        // Валидация позже

        const user = await UserModel.findById(userId); // найдем пользователя по id в базе данных

        if (!user) { // если пользователь не найден, возвращаем ошибку
            return errorRes(res, 404, 'Пользователь не найден');
        }

        const product = await ProductModel.create({ // создаем новый продукт в базе данных
            productName,
            productDescription,
            productPrice,
            productSeller: userId, // id пользователя который продает продукт найденный по userId из JWT
            productCategory,
            productIsAvailable,
        });

        await product.populate('productSeller', 'userName _id'); // подставляем данные продавца вместо id

        return successRes(res, { message: 'Продукт успешно создан', product }, 201);

    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при создании продукта');
    }
}