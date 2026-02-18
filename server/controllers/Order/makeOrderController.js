import { OrderModel, UserModel, ProductModel } from '../../models/index.js';
import { errorRes, successRes } from '../../utils/index.js';

/** Создание заказа. POST /order — создание нового заказа. userBuyerId из JWT, totalAmount считается по ценам товаров. */
export const makeOrderController = async (req, res) => {
    try {
        const userId = req.userId; // только из авторизации, не из body — иначе любой мог бы создавать заказы от чужого имени

        // Создание заказа: из body ожидается items в виде [{ productId, quantity }, ...]. items — это массив объектов, каждый объект содержит productId и quantity. Проверяем, что items — массив и в нём есть хотя бы один элемент.
        const { items, deliveryAddress, paymentMethod, status } = req.body; // извлекаем данные из тела запроса (totalAmount и deliveryDate не из body — считаем/ставим на сервере)
        
        // items: [{ productId, quantity }, ...]. Проверяем, что items — массив и в нём есть хотя бы один элемент.
        const normalizedItems = Array.isArray(items) && items.length > 0
        // если items — массив и в нём есть хотя бы один элемент, то преобразуем его в массив объектов { productId, quantity }
            ? items.map((it) => ({
                productId: it.productId, // из каждого элемента it массива items берётся productId и записывается в позицию заказа
                quantity: Math.max(1, Number(it.quantity) || 1), // quantity приводится к числу и не бывает меньше 1
            }))
            : null;

        if (!normalizedItems) { // если normalizedItems не массив, то возвращаем ошибку
            return errorRes(res, 400, 'items должен быть непустым массивом объектов { productId, quantity }');
        }

        // Считаем totalAmount по ценам товаров из БД (клиент не может подделать сумму)
        // new Set() — создаёт множество уникальных значений (без повторов) из массива productId.
        const productIds = [...new Set(normalizedItems.map((it) => it.productId.toString()))]; // извлекаем все productId из normalizedItems и преобразуем в массив
        
        const products = await ProductModel.find({ _id: { $in: productIds } }).select('_id productPrice').lean(); // найдем все товары по productId в базе данных и выбираем только productPrice
        
        if (products.length !== productIds.length) { // если количество найденных товаров не равно количеству productId, то возвращаем ошибку
            return errorRes(res, 400, 'Один или несколько товаров не найдены');
        }
       
        const priceById = Object.fromEntries(products.map((p) => [p._id.toString(), p.productPrice])); // преобразуем массив товаров в объект, где ключом является productId, а значением - productPrice
       
        const totalAmount = normalizedItems.reduce((sum, it) => { // считаем общую сумму заказа по ценам товаров
            const price = priceById[it.productId.toString()]; // получаем цену товара по productId из объекта priceById
            return sum + (price != null ? price * it.quantity : 0); // суммируем цену товара на количество, если цена не null
        }, 0); // начальное значение суммы - 0

        const user = await UserModel.findById(userId); // найдем пользователя по id в базе данных
        if (!user) { // если пользователь не найден, возвращаем ошибку
            return errorRes(res, 404, 'Пользователь не найден');
        }

        // Текущая дата и время по МСК (UTC+3). Храним как Date — при отображении на фронте с timeZone 'Europe/Moscow' будет московское время.
        const deliveryDate = new Date();

        const order = await OrderModel.create({ // создаем новый заказ в базе данных
            // В создаваемый заказ записывается кто покупатель: в поле userBuyerId подставляется userId из JWT. Подставить другого покупателя через body нельзя.
            userBuyerId: userId, // id текущего пользователя из JWT (req.userId)
            items: normalizedItems,
            totalAmount, // посчитан выше по ценам товаров
            deliveryAddress,
            deliveryDate, // актуальная дата по МСК (текущий момент; на фронте отображать с timeZone 'Europe/Moscow')
            paymentMethod,
            status,
        });

        await order.populate('userBuyerId', 'userName email _id'); // подставляем данные пользователя (покупателя) в заказ
        await order.populate({ // подставляем данные товара в каждую позицию заказа
            path: 'items.productId', // товар в каждой позиции заказа
            select: 'productName productPrice productSeller', // выбираем только productName, productPrice и productSeller
            populate: { path: 'productSeller', select: 'userName _id' }, // пользователь, создавший товар
        });

        // buyList - список покупок модели UserModel (ref: 'Order') для связи с моделью Order
        // проверяем, что buyList это массив и в нём есть хотя бы один элемент.
        user.buyList = Array.isArray(user.buyList) ? user.buyList.filter((id) => id && id.toString?.().match?.(/^[a-f\d]{24}$/i)) : []; 
        
        // user — это покупатель (тот, кто сделал заказ, найден по req.userId). У него в модели User есть поле buyList — массив id заказов. 
        user.buyList.push(order._id);
       
        await user.save({ validateBeforeSave: false }); // сохраняем пользователя в базе данных без валидации

        return successRes(res, { message: 'Заказ успешно создан', order }); // отправляем успешный ответ с сообщением и заказом

    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при создании заказа');
    }
};

/** Получение заказов текущего пользователя. GET /order — только свои заказы (userBuyerId из JWT). */
export const getMyOrdersController = async (req, res) => {
    try {
        const userBuyerId = req.userId;
        
        const orders = await OrderModel.find({ userBuyerId }) // найдем все заказы покупателя в базе данных
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.productId', // товар в заказе
                select: 'productName productPrice productSeller', // выбираем только productName, productPrice и productSeller
                populate: { path: 'productSeller', select: 'userName _id' }, // пользователь, создавший товар
            })
            .lean(); // преобразуем результат в обычный объект

        return successRes(res, { orders });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении заказов');
    }
};

/** Получение всех заказов (только для админа). GET /order/all — все заказы, в каждом есть userBuyerId (и при желании данные юзера через populate). */
export const getAllOrdersController = async (req, res) => {
    try {

        // const currentUserId = req.userId;
        // const currentUser = await UserModel.findById(currentUserId).select('userRole').lean();
        // if (!currentUser || currentUser.userRole !== 'admin') {
        //     return errorRes(res, 403, 'Доступ только для администратора');
        // }
        const orders = await OrderModel.find({}) // найдем все заказы в базе данных
            .sort({ createdAt: -1 }) // сортируем по дате создания в обратном порядке
            .populate('userBuyerId', 'userName email _id') // добавляем данные пользователя (покупателя) в заказ
            .populate({
                path: 'items.productId',
                select: 'productName productPrice productSeller',
                populate: { path: 'productSeller', select: 'userName _id' }, // пользователь, создавший товар
            })
            .lean();
            
        return successRes(res, { orders });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении заказов');
    }
};