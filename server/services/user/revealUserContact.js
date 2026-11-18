import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";

/**
 * @param {{ targetUserId: string }} args
 */
export async function revealUserPhone({ targetUserId }) {
  const user = await UserModel.findById(targetUserId)
    .select("userPhoneNumber isBlockedUser")
    .lean();

  if (!user || user.isBlockedUser) {
    throw new AppError(404, "Пользователь не найден");
  }

  const userPhoneNumber = String(user.userPhoneNumber ?? "").trim();
  if (!userPhoneNumber) {
    throw new AppError(404, "Номер не указан");
  }

  return { userPhoneNumber };
}

/**
 * @param {{ targetUserId: string }} args
 */
export async function revealUserEmail({ targetUserId }) {
  const user = await UserModel.findById(targetUserId)
    .select("email isBlockedUser")
    .lean();

  if (!user || user.isBlockedUser) {
    throw new AppError(404, "Пользователь не найден");
  }

  const email = String(user.email ?? "").trim();
  if (!email) {
    throw new AppError(404, "Почта не указана");
  }

  return { email };
}
