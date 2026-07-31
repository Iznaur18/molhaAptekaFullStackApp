import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";

/** `GET /user/:userIdClient/phone` — reveal после rate limit (номер не в публичном GET профиля). */
export const getUserPhoneController = async (req, res) => {
  const { userIdClient } = req.params;

  const user = await UserModel.findById(userIdClient)
    .select("userPhoneNumber isBlockedUser")
    .lean();

  if (!user || user.isBlockedUser) {
    return errorRes(res, 404, "Пользователь не найден");
  }

  const userPhoneNumber = String(user.userPhoneNumber ?? "").trim();
  if (!userPhoneNumber) {
    return errorRes(res, 404, "Номер не указан");
  }

  return successRes(res, { userPhoneNumber });
};
