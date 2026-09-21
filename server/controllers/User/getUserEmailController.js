import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";

/**
 * `GET /user/:userIdClient/email` — почта по кнопке «Показать почту».
 * В публичном GET профиля её нет, только признак `hasEmail`.
 */
export const getUserEmailController = async (req, res) => {
  const { userIdClient } = req.params;

  const user = await UserModel.findById(userIdClient)
    .select("email isBlockedUser")
    .lean();

  if (!user || user.isBlockedUser) {
    return errorRes(res, 404, "Пользователь не найден");
  }

  const email = String(user.email ?? "").trim();
  if (!email) {
    return errorRes(res, 404, "Почта не указана");
  }

  return successRes(res, { email });
};
