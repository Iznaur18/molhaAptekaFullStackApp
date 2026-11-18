import { successRes } from "../../services/http/index.js";
import { getPublicUserProfile } from "../../services/user/getPublicUserProfile.js";

/** Получение профиля другого пользователя по id. GET /user/:userId (публичный) */
export const userGetProfileController = async (req, res) => {
  const data = await getPublicUserProfile({
    targetUserId: String(req.params.userIdClient),
    req,
  });
  return successRes(res, data);
};
