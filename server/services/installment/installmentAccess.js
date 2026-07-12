import {
  INSTALLMENT_BUYER_REQUIRES_CONFIRMED_MESSAGE,
  INSTALLMENT_SELLER_REQUIRES_CONFIRMED_MESSAGE,
} from "../../constants/installmentConstants.js";
import { UserModel } from "../../models/index.js";

/**
 * @param {unknown} userId
 */
export const assertUserCanManageInstallmentAsSeller = async (userId) => {
  const user = await UserModel.findById(userId)
    .select("isUserDataConfirmed isBlockedUser")
    .lean();
  if (!user || user.isBlockedUser) {
    throw new Error("Пользователь не найден");
  }
  if (user.isUserDataConfirmed !== true) {
    throw new Error(INSTALLMENT_SELLER_REQUIRES_CONFIRMED_MESSAGE);
  }
  return user;
};

/**
 * @param {unknown} userId
 */
export const assertUserCanBuyInstallment = async (userId) => {
  const user = await UserModel.findById(userId)
    .select("isUserDataConfirmed isBlockedUser")
    .lean();
  if (!user || user.isBlockedUser) {
    throw new Error("Пользователь не найден");
  }
  if (user.isUserDataConfirmed !== true) {
    throw new Error(INSTALLMENT_BUYER_REQUIRES_CONFIRMED_MESSAGE);
  }
  return user;
};
