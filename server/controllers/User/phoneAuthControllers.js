import bcrypt from "bcrypt";

import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { sendUserWithToken } from "../../services/auth/sendUserWithToken.js";
import { DUMMY_PASSWORD_HASH } from "../../services/auth/dummyPasswordHash.js";
import {
  confirmPhoneBindForUser,
  confirmPhoneLoginOtp,
  requestPhoneBindForUser,
  requestPhoneLoginOtp,
} from "../../services/auth/phoneVerification.js";
import { createPendingPhoneRegistration } from "../../services/auth/pendingRegistration.js";
import {
  PHONE_LOGIN_INVALID_MESSAGE,
  PHONE_OTP_LOGIN_GENERIC_MESSAGE,
  PHONE_VERIFICATION_SENT_MESSAGE,
  PHONE_VERIFICATION_SUCCESS_MESSAGE,
  SMS_DELIVERY_UNAVAILABLE_MESSAGE,
} from "../../constants/phoneVerificationConstants.js";
import { DEFAULT_AVATAR_URL } from "../../constants/constants.js";
import {
  formatUserBackgroundPresetValue,
  getDefaultUserBackgroundStoredValue,
  isUserBackgroundPresetId,
} from "../../constants/userBackgroundPresets.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

function pickUrlOrDefault(value, defaultUrl) {
  if (value == null || String(value).trim() === "") return defaultUrl;
  return String(value).trim();
}

function resolveRegisterBackground(presetId) {
  const id = presetId == null ? "" : String(presetId).trim();
  if (id === "") return getDefaultUserBackgroundStoredValue();
  if (!isUserBackgroundPresetId(id)) {
    return getDefaultUserBackgroundStoredValue();
  }
  return formatUserBackgroundPresetValue(id);
}

function isSmsDeliveryFailure(message) {
  return (
    message === "SMS_DELIVERY_UNAVAILABLE" ||
    message.startsWith("SMS_DELIVERY_UNAVAILABLE") ||
    message === SMS_DELIVERY_UNAVAILABLE_MESSAGE ||
    message.startsWith(`${SMS_DELIVERY_UNAVAILABLE_MESSAGE}:`)
  );
}

function mapSmsDeliveryError(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!isSmsDeliveryFailure(message)) {
    return message;
  }
  const detail =
    error?.smspilotDescription ||
    (message.includes(": ") ? message.slice(message.indexOf(": ") + 2).trim() : "");
  if (detail && !detail.startsWith(SMS_DELIVERY_UNAVAILABLE_MESSAGE)) {
    return `${SMS_DELIVERY_UNAVAILABLE_MESSAGE}: ${detail}`;
  }
  if (detail) return detail;
  return SMS_DELIVERY_UNAVAILABLE_MESSAGE;
}

/** POST /auth/register/phone */
export const registerPhoneUserController = async (req, res) => {
  const {
    phoneNumber,
    password,
    userName,
    avatarUrl,
    backgroundPresetId,
    userBirthDate,
    userGender,
    notificationsEnabled,
    referralCode,
  } = req.body;

  const normalizedUserName = String(userName).trim().toLowerCase();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  let pendingInfo;
  try {
    pendingInfo = await createPendingPhoneRegistration({
      userPhoneNumber: phoneNumber,
      passwordHash,
      userName: normalizedUserName,
      userAvatarUrl: pickUrlOrDefault(avatarUrl, DEFAULT_AVATAR_URL),
      userBackgroundUrl: resolveRegisterBackground(backgroundPresetId),
      userBirthDate: userBirthDate ? new Date(userBirthDate) : null,
      userGender: userGender || "noSelected",
      notificationsEnabled:
        typeof notificationsEnabled === "boolean" ? notificationsEnabled : null,
      userAddress: req.verifiedDeliveryAddress?.displayAddress ?? "",
      userAddressFlat: req.verifiedDeliveryAddress?.flat ?? "",
      userAddressFiasId: req.verifiedDeliveryAddress?.fiasId ?? "",
      userAddressGeo: req.verifiedDeliveryAddress?.geo ?? null,
      referralCode: referralCode ?? null,
    });
  } catch (registrationError) {
    const message = mapSmsDeliveryError(registrationError);
    if (isSmsDeliveryFailure(message) || isSmsDeliveryFailure(String(registrationError?.message ?? ""))) {
      return errorRes(res, 503, message);
    }
    return errorRes(res, 400, message || "Не удалось начать регистрацию");
  }

  return successRes(res, {
    pendingRegistration: true,
    registrationId: pendingInfo.registrationId,
    phoneNumber: pendingInfo.phoneNumber,
    message: PHONE_VERIFICATION_SENT_MESSAGE,
  });
};

/** POST /auth/login/phone — телефон + пароль */
export const loginPhonePasswordController = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await UserModel.findOne({ userPhoneNumber: phoneNumber }).select(
      "+passwordHash +authTokenVersion",
    );

    const passwordHashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isValidPassword = await bcrypt.compare(password, passwordHashToCompare);

    if (!user || !isValidPassword) {
      return errorRes(res, 400, PHONE_LOGIN_INVALID_MESSAGE);
    }

    if (user.isBlockedUser) {
      return errorRes(res, 403, "Аккаунт заблокирован");
    }

    if (user.isActiveUser === false) {
      return errorRes(res, 403, "Аккаунт отключён администратором");
    }

    user.userLastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return sendUserWithToken(user, res, req);
  } catch (error) {
    logServerEvent("error", {
      event: "unhandled_error",
      error: error instanceof Error ? error.message : String(error),
    });
    return errorRes(res, 500, "Ошибка при входе");
  }
};

/** POST /auth/login/phone/otp/request */
export const loginPhoneOtpRequestController = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    await requestPhoneLoginOtp(phoneNumber);
  } catch (error) {
    const message = mapSmsDeliveryError(error);
    if (isSmsDeliveryFailure(message) || isSmsDeliveryFailure(String(error?.message ?? ""))) {
      return errorRes(res, 503, message);
    }
    return errorRes(res, 400, message);
  }

  // Anti-enumeration: одинаковый ответ, даже если SMS не слали
  return successRes(res, { message: PHONE_OTP_LOGIN_GENERIC_MESSAGE });
};

/** POST /auth/login/phone/otp/confirm */
export const loginPhoneOtpConfirmController = async (req, res) => {
  const { phoneNumber, code } = req.body;

  let user;
  try {
    user = await confirmPhoneLoginOtp(phoneNumber, code);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось войти";
    if (message === "Аккаунт заблокирован" || message.includes("отключён")) {
      return errorRes(res, 403, message);
    }
    return errorRes(res, 400, message);
  }

  return sendUserWithToken(user, res, req);
};

/** POST /auth/phone/bind/request (auth) */
export const phoneBindRequestController = async (req, res) => {
  try {
    const result = await requestPhoneBindForUser(req.user._id, req.body.phoneNumber);
    return successRes(res, {
      phoneNumber: result.phoneNumber,
      message: PHONE_VERIFICATION_SENT_MESSAGE,
    });
  } catch (error) {
    const message = mapSmsDeliveryError(error);
    if (isSmsDeliveryFailure(message) || isSmsDeliveryFailure(String(error?.message ?? ""))) {
      return errorRes(res, 503, message);
    }
    return errorRes(res, 400, message);
  }
};

/** POST /auth/phone/bind/confirm (auth) */
export const phoneBindConfirmController = async (req, res) => {
  try {
    const result = await confirmPhoneBindForUser(req.user._id, req.body.code);
    return successRes(res, {
      phoneNumber: result.phoneNumber,
      message: PHONE_VERIFICATION_SUCCESS_MESSAGE,
    });
  } catch (error) {
    return errorRes(
      res,
      400,
      error instanceof Error ? error.message : "Не удалось подтвердить телефон",
    );
  }
};
