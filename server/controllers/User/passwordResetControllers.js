import { errorRes, successRes } from "../../services/http/index.js";
import { issueRotatedAuthSession } from "../../services/auth/issueAuthSession.js";
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
import { SMS_DELIVERY_UNAVAILABLE_MESSAGE } from "../../constants/phoneVerificationConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

function isSmsDeliveryFailure(message) {
  return (
    message === "SMS_DELIVERY_UNAVAILABLE" ||
    message.startsWith("SMS_DELIVERY_UNAVAILABLE") ||
    message === SMS_DELIVERY_UNAVAILABLE_MESSAGE ||
    message.startsWith(`${SMS_DELIVERY_UNAVAILABLE_MESSAGE}:`)
  );
}

function isEmailDeliveryFailure(message) {
  return message === "EMAIL_DELIVERY_UNAVAILABLE";
}

function mapDeliveryError(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (isEmailDeliveryFailure(message)) {
    return "Не удалось отправить письмо. Попробуйте позже";
  }
  if (isSmsDeliveryFailure(message)) {
    const detail =
      error?.smspilotDescription ||
      (message.includes(": ") ? message.slice(message.indexOf(": ") + 2).trim() : "");
    if (detail && !detail.startsWith(SMS_DELIVERY_UNAVAILABLE_MESSAGE)) {
      return `${SMS_DELIVERY_UNAVAILABLE_MESSAGE}: ${detail}`;
    }
    if (detail) return detail;
    return SMS_DELIVERY_UNAVAILABLE_MESSAGE;
  }
  return message;
}

/** POST /auth/password/reset/request */
export const passwordResetRequestController = async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    await requestPasswordReset({ email, phoneNumber });
  } catch (error) {
    const message = mapDeliveryError(error);
    if (
      isEmailDeliveryFailure(String(error?.message ?? "")) ||
      isSmsDeliveryFailure(message) ||
      isSmsDeliveryFailure(String(error?.message ?? ""))
    ) {
      return errorRes(res, 503, message);
    }
    return errorRes(res, 400, message);
  }

  return successRes(res, { message: PASSWORD_RESET_GENERIC_MESSAGE });
};

/** POST /auth/password/reset/confirm */
export const passwordResetConfirmController = async (req, res) => {
  const { email, phoneNumber, code, newPassword } = req.body;

  try {
    await confirmPasswordReset({ email, phoneNumber, code, newPassword });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось сбросить пароль";
    if (message === "Аккаунт заблокирован" || message.includes("отключён")) {
      return errorRes(res, 403, message);
    }
    return errorRes(res, 400, message);
  }

  return successRes(res, { message: PASSWORD_RESET_SUCCESS_MESSAGE });
};

/** POST /auth/password/change (auth) */
export const passwordChangeController = async (req, res) => {
  try {
    const user = await changePasswordForUser(req.userId, {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });
    const data = await issueRotatedAuthSession(user, res, req);
    return successRes(res, {
      ...data,
      message: PASSWORD_CHANGE_SUCCESS_MESSAGE,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось сменить пароль";
    logServerEvent("warn", {
      event: "password_change_failed",
      userId: String(req.userId ?? ""),
      error: message,
    });
    return errorRes(res, 400, message);
  }
};
