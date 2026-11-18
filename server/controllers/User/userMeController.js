import { successRes } from "../../services/http/index.js";
import { getMe } from "../../services/user/getMe.js";

/** Получение данных текущего пользователя. GET /auth/me (JWT в httpOnly cookie) */
export const userMeController = async (req, res) => {
  // Состояние авторизации нельзя кэшировать: с ETag браузер при перезагрузке
  // делает условный запрос и получает 304, который axios трактует как ошибку.
  res.set("Cache-Control", "no-store");
  const data = await getMe({ userId: req.userId });
  return successRes(res, data);
};
