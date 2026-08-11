import bcrypt from "bcrypt";

import { UserModel } from "../../models/index.js";
import { errorRes } from "../../services/http/index.js";
import { sendUserWithToken } from "../../services/auth/sendUserWithToken.js";
import { DUMMY_PASSWORD_HASH } from "../../services/auth/dummyPasswordHash.js";
import {
  logSecurityEvent,
  logSecurityFailure,
  securityRequestFields,
} from "../../services/auth/logSecurityEvent.js";

/** Вход по email + пароль. POST /auth/login */
export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select(
      "+passwordHash +authTokenVersion",
    );

    const passwordHashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isValidPassword = await bcrypt.compare(password, passwordHashToCompare);

    if (!user || !isValidPassword) {
      logSecurityEvent("warn", "login_failed", {
        ...securityRequestFields(req),
        methodKind: "email_password",
        reason: "invalid_credentials",
      });
      return errorRes(res, 400, "Неверный email или пароль");
    }

    if (user.isBlockedUser) {
      logSecurityEvent("warn", "login_failed", {
        ...securityRequestFields(req),
        methodKind: "email_password",
        reason: "blocked",
        userId: String(user._id),
      });
      return errorRes(res, 403, "Аккаунт заблокирован");
    }

    if (user.isActiveUser === false) {
      logSecurityEvent("warn", "login_failed", {
        ...securityRequestFields(req),
        methodKind: "email_password",
        reason: "disabled",
        userId: String(user._id),
      });
      return errorRes(res, 403, "Аккаунт отключён администратором");
    }

    user.userLastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    logSecurityEvent("info", "login_ok", {
      ...securityRequestFields(req),
      methodKind: "email_password",
      userId: String(user._id),
    });

    return sendUserWithToken(user, res, req);
  } catch (error) {
    logSecurityFailure("login", securityRequestFields(req), error);
    return errorRes(res, 500, "Ошибка при входе");
  }
};
