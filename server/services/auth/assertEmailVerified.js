import { UserModel } from "../../models/index.js";
import { EMAIL_NOT_VERIFIED_MESSAGE } from "../../constants/emailVerificationConstants.js";

/**
 * Контакт для заказа/рассрочки: подтверждённый email ИЛИ подтверждённый телефон.
 *
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @returns {Promise<{ ok: true } | { ok: false; message: string }>}
 */
export const checkUserEmailVerified = async (userId) => {
  const user = await UserModel.findById(userId)
    .select("isEmailVerified email isPhoneVerified userPhoneNumber")
    .lean();

  if (!user) {
    return { ok: false, message: "Пользователь не найден" };
  }

  if (user.isEmailVerified === true && user.email) {
    return { ok: true };
  }

  if (user.isPhoneVerified === true && user.userPhoneNumber) {
    return { ok: true };
  }

  if (user.email && user.isEmailVerified !== true) {
    return { ok: false, message: EMAIL_NOT_VERIFIED_MESSAGE };
  }

  if (user.userPhoneNumber && user.isPhoneVerified !== true) {
    return {
      ok: false,
      message: "Подтвердите номер телефона перед оформлением заказа или рассрочки",
    };
  }

  return {
    ok: false,
    message: "Укажите и подтвердите email или телефон перед оформлением заказа",
  };
};
