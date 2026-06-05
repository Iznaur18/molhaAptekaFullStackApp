import { UserModel } from "../models/index.js";
import { errorRes } from "../utils/index.js";

const ADMIN_ROLE = "admin";

/**
 * Требует, чтобы текущий пользователь имел роль admin.
 * Должен быть после `checkAuthMW`, читает `req.userId` и подкладывает `req.userRole`.
 */
export const checkAdminMW = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId).select("userRole").lean();

    if (!user) {
      return errorRes(res, 401, "Пользователь не найден");
    }
    if (user.userRole !== ADMIN_ROLE) {
      return errorRes(res, 403, "Доступ только для администратора");
    }

    req.userRole = user.userRole;
    return next();
  } catch (error) {
    return next(error);
  }
};
