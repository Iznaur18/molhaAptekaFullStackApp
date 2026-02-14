import { OrderModel, UserModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

/** Создание заказа. POST /order — создание нового заказа. userId берётся из JWT (req.userId), не из body. */
export const makeOrderController = async (req, res) => {
    try {
        const userId = req.userId; // только из авторизации, не из body — иначе любой мог бы создавать заказы от чужого имени
        const { items, totalAmount, deliveryAddress, deliveryDate, paymentMethod, status } = req.body; // извлекаем данные из тела запроса для создания нового заказа

        const user = await UserModel.findById(userId); // найдем пользователя по id в базе данных

        if (!user) { // если пользователь не найден, возвращаем ошибку
            return errorRes(res, 404, 'Пользователь не найден');
        }

        const order = await OrderModel.create({ // создаем новый заказ в базе данных
            userId,
            items,
            totalAmount,
            deliveryAddress,
            deliveryDate,
            paymentMethod,
            status,
        });

        // buyList - список покупок модели UserModel (ref: 'Order') для связи с моделью Order
        user.buyList = user.buyList || []; // если пользователь не имеет списка покупок, создаем пустой массив
        user.buyList.push(order._id); // добавляем id нового заказа в список покупок userModel buyList
        await user.save({ validateBeforeSave: false }); // сохраняем пользователя в базе данных без валидации

        return successRes(res, { message: 'Заказ успешно создан', order }); // отправляем успешный ответ с сообщением и заказом

    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при создании заказа');
    }
};

/** Получение заказов текущего пользователя. GET /order — только свои заказы (userId из JWT). */
export const getMyOrdersController = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
        return successRes(res, { orders });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении заказов');
    }
};

/** Получение всех заказов (только для админа). GET /order/all — все заказы, в каждом есть userId (и при желании данные юзера через populate). */
export const getAllOrdersController = async (req, res) => {
    try {
        // const currentUserId = req.userId;
        // const currentUser = await UserModel.findById(currentUserId).select('userRole').lean();
        // if (!currentUser || currentUser.userRole !== 'admin') {
        //     return errorRes(res, 403, 'Доступ только для администратора');
        // }
        const orders = await OrderModel.find({}) // найдем все заказы в базе данных
            .sort({ createdAt: -1 }) // сортируем по дате создания в обратном порядке
            .populate('userId', 'userName email _id') // добавляем данные пользователя в заказ
            .lean();
        return successRes(res, { orders });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении заказов');
    }
};