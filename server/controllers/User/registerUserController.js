import bcrypt from "bcrypt";
import { errorRes, successRes } from "../../services/http/index.js";
import { sendUserWithToken } from "../../services/auth/sendUserWithToken.js";
import {
  confirmPendingRegistration,
  createPendingRegistration,
  resendPendingRegistrationCode,
} from "../../services/auth/pendingRegistration.js";
import { EMAIL_VERIFICATION_SENT_MESSAGE } from "../../constants/emailVerificationConstants.js";
import { DEFAULT_AVATAR_URL } from "../../constants/constants.js";
import {
  formatUserBackgroundPresetValue,
  getDefaultUserBackgroundStoredValue,
  isUserBackgroundPresetId,
} from "../../constants/userBackgroundPresets.js";

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

/**
 * Начало регистрации: аккаунт НЕ создаётся — данные сохраняются в заявку
 * (PendingRegistration, TTL), на почту уходит код. POST /auth/register
 */
export const registerUserController = async (req, res) => {
  const {
    email,
    password,
    userName,
    phoneNumber,
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

  const userPhoneNumber =
    phoneNumber != null && phoneNumber !== "" ? String(phoneNumber).trim() : null;

  let pendingInfo;
  try {
    // все опциональные поля передаются явно (null/""), чтобы upsert по email
    // полностью заменял предыдущую заявку, а не смешивался с ней
    pendingInfo = await createPendingRegistration({
      email,
      passwordHash,
      userName: normalizedUserName,
      userPhoneNumber,
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
    const message =
      registrationError instanceof Error
        ? registrationError.message
        : "Не удалось начать регистрацию";
    if (message === "EMAIL_DELIVERY_UNAVAILABLE") {
      return errorRes(res, 503, "Не удалось отправить письмо. Попробуйте позже");
    }
    return errorRes(res, 400, message);
  }

  return successRes(res, {
    pendingRegistration: true,
    registrationId: pendingInfo.registrationId,
    email: pendingInfo.email,
    message: EMAIL_VERIFICATION_SENT_MESSAGE,
  });
};

/**
 * Завершение регистрации: код подтверждён — только теперь создаётся аккаунт
 * (isEmailVerified: true) и выдаётся сессия. POST /auth/register/confirm
 */
export const confirmRegistrationController = async (req, res) => {
  const { registrationId, code } = req.body;

  let user;
  try {
    user = await confirmPendingRegistration(registrationId, code);
  } catch (confirmError) {
    return errorRes(
      res,
      400,
      confirmError instanceof Error
        ? confirmError.message
        : "Не удалось подтвердить регистрацию",
    );
  }

  return sendUserWithToken(user, res, req);
};

/**
 * Повторная отправка кода по заявке на регистрацию. POST /auth/register/resend
 */
export const resendRegistrationCodeController = async (req, res) => {
  const { registrationId } = req.body;

  try {
    await resendPendingRegistrationCode(registrationId);
  } catch (resendError) {
    return errorRes(
      res,
      400,
      resendError instanceof Error ? resendError.message : "Не удалось отправить письмо",
    );
  }

  return successRes(res, { message: EMAIL_VERIFICATION_SENT_MESSAGE });
};
