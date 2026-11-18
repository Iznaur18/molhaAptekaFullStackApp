import { sanitizeMarketingAttribution } from "@izibuy/shared-lib";
import bcrypt from "bcrypt";

import { UserModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import { successRes } from "../../services/http/index.js";
import { sendUserWithToken } from "../../services/auth/sendUserWithToken.js";
import { DUMMY_PASSWORD_HASH } from "../../services/auth/dummyPasswordHash.js";
import {
  confirmPhoneBindForUser,
  confirmPhoneLoginOtp,
  requestPhoneBindForUser,
  requestPhoneLoginOtp,
} from "../../services/auth/phoneVerification.js";
import { createPendingPhoneRegistration } from "../../services/auth/pendingRegistration.js";
import { throwMappedAuthChannelError } from "../../services/auth/mapAuthChannelError.js";
import {
  PHONE_LOGIN_INVALID_MESSAGE,
  PHONE_OTP_LOGIN_GENERIC_MESSAGE,
  PHONE_VERIFICATION_SENT_MESSAGE,
  PHONE_VERIFICATION_SUCCESS_MESSAGE,
} from "../../constants/phoneVerificationConstants.js";
import { DEFAULT_AVATAR_URL } from "../../constants/constants.js";
import {
  formatUserBackgroundPresetValue,
  getDefaultUserBackgroundStoredValue,
  isUserBackgroundPresetId,
} from "../../constants/userBackgroundPresets.js";
import {
  logSecurityEvent,
  securityRequestFields,
} from "../../services/auth/logSecurityEvent.js";

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
    marketingAttribution,
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
      marketingAttribution: sanitizeMarketingAttribution(marketingAttribution),
    });
  } catch (registrationError) {
    throwMappedAuthChannelError(registrationError, {
      fallbackMessage: "Не удалось начать регистрацию",
    });
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
  const { phoneNumber, password } = req.body;

  const user = await UserModel.findOne({ userPhoneNumber: phoneNumber }).select(
    "+passwordHash +authTokenVersion",
  );

  const passwordHashToCompare = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const isValidPassword = await bcrypt.compare(password, passwordHashToCompare);

  if (!user || !isValidPassword) {
    logSecurityEvent("warn", "login_failed", {
      ...securityRequestFields(req),
      methodKind: "phone_password",
      reason: "invalid_credentials",
    });
    throw new AppError(400, PHONE_LOGIN_INVALID_MESSAGE);
  }

  if (user.isBlockedUser) {
    logSecurityEvent("warn", "login_failed", {
      ...securityRequestFields(req),
      methodKind: "phone_password",
      reason: "blocked",
      userId: String(user._id),
    });
    throw new AppError(403, "Аккаунт заблокирован");
  }

  if (user.isActiveUser === false) {
    logSecurityEvent("warn", "login_failed", {
      ...securityRequestFields(req),
      methodKind: "phone_password",
      reason: "disabled",
      userId: String(user._id),
    });
    throw new AppError(403, "Аккаунт отключён администратором");
  }

  user.userLastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  logSecurityEvent("info", "login_ok", {
    ...securityRequestFields(req),
    methodKind: "phone_password",
    userId: String(user._id),
  });

  return sendUserWithToken(user, res, req);
};

/** POST /auth/login/phone/otp/request */
export const loginPhoneOtpRequestController = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    await requestPhoneLoginOtp(phoneNumber);
  } catch (error) {
    throwMappedAuthChannelError(error);
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
    const reason =
      message === "Аккаунт заблокирован"
        ? "blocked"
        : message.includes("отключён")
          ? "disabled"
          : message.includes("попыток")
            ? "attempts_exceeded"
            : "invalid_otp";
    logSecurityEvent("warn", "otp_login_failed", {
      ...securityRequestFields(req),
      methodKind: "phone_otp",
      reason,
    });
    if (error instanceof AppError) {
      throw error;
    }
    if (message === "Аккаунт заблокирован" || message.includes("отключён")) {
      throw new AppError(403, message);
    }
    throw new AppError(400, message);
  }

  logSecurityEvent("info", "login_ok", {
    ...securityRequestFields(req),
    methodKind: "phone_otp",
    userId: String(user._id),
  });

  return sendUserWithToken(user, res, req);
};

/** POST /auth/phone/bind/request (auth) */
export const phoneBindRequestController = async (req, res) => {
  let result;
  try {
    result = await requestPhoneBindForUser(req.userId, req.body.phoneNumber);
  } catch (error) {
    throwMappedAuthChannelError(error);
  }
  return successRes(res, {
    phoneNumber: result.phoneNumber,
    message: PHONE_VERIFICATION_SENT_MESSAGE,
  });
};

/** POST /auth/phone/bind/confirm (auth) */
export const phoneBindConfirmController = async (req, res) => {
  let result;
  try {
    result = await confirmPhoneBindForUser(req.userId, req.body.code);
  } catch (error) {
    throwMappedAuthChannelError(error, {
      fallbackMessage: "Не удалось подтвердить телефон",
    });
  }
  return successRes(res, {
    phoneNumber: result.phoneNumber,
    message: PHONE_VERIFICATION_SUCCESS_MESSAGE,
  });
};
