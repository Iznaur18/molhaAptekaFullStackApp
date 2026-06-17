import { UserModel } from "../../models/index.js";
import { EMAIL_NOT_VERIFIED_MESSAGE } from "../../constants/emailVerificationConstants.js";

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @returns {Promise<{ ok: true } | { ok: false; message: string }>}
 */
export const checkUserEmailVerified = async (userId) => {
  const user = await UserModel.findById(userId).select("isEmailVerified email").lean();

  if (!user) {
    return { ok: false, message: "Пользователь не найден" };
  }

  if (!user.email) {
    return { ok: false, message: "У аккаунта не указан email" };
  }

  if (user.isEmailVerified !== true) {
    return { ok: false, message: EMAIL_NOT_VERIFIED_MESSAGE };
  }

  return { ok: true };
};
