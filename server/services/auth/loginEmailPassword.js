import bcrypt from "bcrypt";

import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { DUMMY_PASSWORD_HASH } from "./dummyPasswordHash.js";
import { logSecurityEvent } from "./logSecurityEvent.js";

/**
 * Email + пароль. Возвращает mongoose-документ пользователя для `sendUserWithToken`.
 *
 * @param {{
 *   email: string;
 *   password: string;
 *   securityFields: Record<string, unknown>;
 * }} args
 */
export async function authenticateEmailPasswordLogin({
  email,
  password,
  securityFields,
}) {
  const user = await UserModel.findOne({ email }).select(
    "+passwordHash +authTokenVersion",
  );

  const passwordHashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const isValidPassword = await bcrypt.compare(password, passwordHashToCompare);

  if (!user || !isValidPassword) {
    logSecurityEvent("warn", "login_failed", {
      ...securityFields,
      methodKind: "email_password",
      reason: "invalid_credentials",
    });
    throw new AppError(400, "Неверный email или пароль");
  }

  if (user.isBlockedUser) {
    logSecurityEvent("warn", "login_failed", {
      ...securityFields,
      methodKind: "email_password",
      reason: "blocked",
      userId: String(user._id),
    });
    throw new AppError(403, "Аккаунт заблокирован");
  }

  if (user.isActiveUser === false) {
    logSecurityEvent("warn", "login_failed", {
      ...securityFields,
      methodKind: "email_password",
      reason: "disabled",
      userId: String(user._id),
    });
    throw new AppError(403, "Аккаунт отключён администратором");
  }

  user.userLastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  logSecurityEvent("info", "login_ok", {
    ...securityFields,
    methodKind: "email_password",
    userId: String(user._id),
  });

  return user;
}
