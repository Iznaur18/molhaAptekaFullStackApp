import { UserModel } from '../../models/index.js';
import { sendUserWithToken, errorRes } from '../../utils/index.js';

/** Вход/регистрация через Telegram. POST /auth/telegram — если пользователь есть, логин; иначе создание. */
export const authTelegramController = async (req, res) => { // обработчик входа/регистрации через Telegram
    try {
        const { telegramUserId, telegramUsername, telegramPhotoUrl, userName, avatarUrl, address } = req.body; // извлекаем данные из тела запроса для создания нового пользователя. API Telegram присылает эти данные в теле запроса. (валидация telegramUserId выполняется в middleware telegramAuthValidation)

        const findedUser = await UserModel.findOne({ telegramUserId }); // ищем пользователя по telegramUserId. Возвращает первый найденный пользователь. Если пользователь не найден, возвращает null.

        if (findedUser) { // если пользователь найден, отправляем его с токеном
            return sendUserWithToken(findedUser, res); // отправляем пользователя с токеном
        }

        const doc = new UserModel({ // создаем новый пользователя в базе данных если пользователь не найден по telegramUserId
            userName: userName ?? `tg_${telegramUserId}`, // если userName не передан в запросе, подставляем tg_<telegramUserId>
            userAvatarUrl: avatarUrl ?? undefined, // если avatarUrl не передан в запросе, подставляем undefined
            userAddress: address ?? undefined, // если address не передан в запросе, подставляем undefined
            telegramUserId, // telegramUserId передаем в документ
            telegramUsername: telegramUsername ?? undefined, // если telegramUsername не передан в запросе, подставляем undefined
            telegramPhotoUrl: telegramPhotoUrl ?? undefined, // если telegramPhotoUrl не передан в запросе, подставляем undefined
        });

        const user = await doc.save(); // сохраняем пользователя в базу данных созданного через Telegram вход/регистрации.

        return sendUserWithToken(user, res); // отправляем пользователя с токеном созданного через Telegram вход/регистрации

    } catch (error) {
        if (error.code === 11000) { // если пользователь с таким telegramUserId уже существует, возвращаем ошибку
            return errorRes(res, 400, 'Пользователь с таким telegram уже существует');
        }
        console.error(error);
        return errorRes(res, 500, 'Ошибка при авторизации через Telegram');
    }
};