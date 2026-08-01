import bcrypt from "bcrypt";

import { UserModel } from "../../models/index.js";
import { errorRes } from "../../services/http/index.js";
import { sendUserWithToken } from "../../services/auth/sendUserWithToken.js";
import { DUMMY_PASSWORD_HASH } from "../../services/auth/dummyPasswordHash.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/** Вход по email + пароль. POST /auth/login */
export const loginUserController = async (req, res) => {
  // обработчик входа по email + пароль
  try {
    const { email, password } = req.body; // извлекаем email и пароль из тела запроса (валидация выполняется в middleware loginUserValidation)

    // `authTokenVersion` — select:false; без него сессия подписывалась бы tv=0
    // при реальной версии N в БД, и refresh после первого логаута умирал бы.
    const user = await UserModel.findOne({ email }).select(
      "+passwordHash +authTokenVersion",
    );

    // Константное по времени сравнение: для несуществующего email всё равно
    // прогоняем bcrypt.compare против dummy-хеша, чтобы по времени ответа
    // нельзя было отличить «нет такого email» от «неверный пароль»
    // (user enumeration через тайминг).
    const passwordHashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isValidPassword = await bcrypt.compare(password, passwordHashToCompare);

    if (!user || !isValidPassword) {
      // единый ответ и для отсутствующего юзера, и для неверного пароля
      return errorRes(res, 400, "Неверный email или пароль");
    }

    if (user.isBlockedUser) {
      return errorRes(res, 403, "Аккаунт заблокирован");
    }

    if (user.isActiveUser === false) {
      return errorRes(res, 403, "Аккаунт отключён администратором");
    }

    user.userLastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return sendUserWithToken(user, res, req); // отправляем пользователя с токеном вход по email + пароль
  } catch (error) {
    logServerEvent("error", {
      event: "unhandled_error",
      error: error instanceof Error ? error.message : String(error),
    });
    return errorRes(res, 500, "Ошибка при входе"); // если произошла ошибка, возвращаем ошибку
  }
};
