import { successRes } from "../../services/http/index.js";
import { AppError } from "../../errors/AppError.js";
import { issueRotatedAuthSession } from "../../services/auth/issueAuthSession.js";
import { throwMappedAuthChannelError } from "../../services/auth/mapAuthChannelError.js";
import {
  changePasswordForUser,
  confirmPasswordReset,
  requestPasswordReset,
} from "../../services/auth/passwordReset.js";
import {
  PASSWORD_CHANGE_SUCCESS_MESSAGE,
  PASSWORD_RESET_GENERIC_MESSAGE,
  PASSWORD_RESET_SUCCESS_MESSAGE,
} from "../../constants/passwordResetConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * @param {unknown} error
 * @param {string} fallbackMessage
 * @returns {never}
 */
function throwPasswordResetError(error, fallbackMessage) {
  if (error instanceof AppError) {
    throw error;
  }
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (message === "Аккаунт заблокирован" || message.includes("отключён")) {
    throw new AppError(403, message);
  }
  throwMappedAuthChannelError(error, { fallbackMessage });
}

/** POST /auth/password/reset/request */
export const passwordResetRequestController = async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    await requestPasswordReset({ email, phoneNumber });
  } catch (error) {
    throwMappedAuthChannelError(error, {
      fallbackMessage: "Не удалось отправить код сброса пароля",
    });
  }

  return successRes(res, { message: PASSWORD_RESET_GENERIC_MESSAGE });
};

/** POST /auth/password/reset/confirm */
export const passwordResetConfirmController = async (req, res) => {
  const { email, phoneNumber, code, newPassword } = req.body;

  try {
    await confirmPasswordReset({ email, phoneNumber, code, newPassword });
  } catch (error) {
    throwPasswordResetError(error, "Не удалось сбросить пароль");
  }

  return successRes(res, { message: PASSWORD_RESET_SUCCESS_MESSAGE });
};

/** POST /auth/password/change (auth) */
export const passwordChangeController = async (req, res) => {
  let user;
  try {
    user = await changePasswordForUser(req.userId, {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось сменить пароль";
    logServerEvent("warn", {
      event: "password_change_failed",
      userId: String(req.userId ?? ""),
      error: message,
    });
    throwMappedAuthChannelError(error, {
      fallbackMessage: "Не удалось сменить пароль",
    });
  }

  const data = await issueRotatedAuthSession(user, res, req);
  return successRes(res, {
    ...data,
    message: PASSWORD_CHANGE_SUCCESS_MESSAGE,
  });
};
