import crypto from "crypto";

import { UserModel } from "../../models/index.js";
import {
  PHONE_NOT_SET_MESSAGE,
  PHONE_TAKEN_MESSAGE,
  PHONE_VERIFICATION_ALREADY_VERIFIED_MESSAGE,
  PHONE_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE,
  PHONE_VERIFICATION_CODE_LENGTH,
  PHONE_VERIFICATION_INVALID_CODE_MESSAGE,
  PHONE_VERIFICATION_MAX_ATTEMPTS,
  PHONE_VERIFICATION_TOKEN_TTL_MS,
  SMS_DELIVERY_UNAVAILABLE_MESSAGE,
} from "../../constants/phoneVerificationConstants.js";
import { sendSmspilotSms } from "../../utils/smspilotClient.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  generateEmailVerificationCode,
  hashEmailVerificationSecret,
} from "./emailVerification.js";

const PHONE_CODE_PATTERN = new RegExp(`^\\d{${PHONE_VERIFICATION_CODE_LENGTH}}$`);

export const hashPhoneVerificationSecret = hashEmailVerificationSecret;
export const generatePhoneVerificationCode = generateEmailVerificationCode;

/**
 * @param {{ phoneNumber: string; code: string }} params
 */
export async function deliverPhoneVerificationSms({ phoneNumber, code }) {
  // Должен совпадать с общим сервисным шаблоном SMSPILOT
  // «Код подтверждения: ______» — иначе ошибка 223 (антиспам) у частных клиентов.
  // https://smspilot.ru/price_personal.php?tab=tpl
  const text = `Код подтверждения: ${code}`;
  try {
    await sendSmspilotSms({ to: phoneNumber, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "SMS_DELIVERY_UNAVAILABLE" || message.startsWith("SMS_DELIVERY_UNAVAILABLE")) {
      const detail =
        error?.smspilotDescription ||
        (message.includes(": ") ? message.slice(message.indexOf(": ") + 2) : "");
      const wrapped = new Error(
        detail
          ? `${SMS_DELIVERY_UNAVAILABLE_MESSAGE}: ${detail}`
          : SMS_DELIVERY_UNAVAILABLE_MESSAGE,
      );
      if (error?.smspilotDescription) {
        wrapped.smspilotDescription = error.smspilotDescription;
      }
      throw wrapped;
    }
    throw error;
  }
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {string} phoneNumber E.164
 * @returns {Promise<string>} raw code
 */
export async function issuePhoneVerificationCode(userId, phoneNumber) {
  const rawCode = generatePhoneVerificationCode();
  const tokenHash = hashPhoneVerificationSecret(rawCode);
  const expiresAt = new Date(Date.now() + PHONE_VERIFICATION_TOKEN_TTL_MS);

  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      pendingPhoneNumber: phoneNumber,
      phoneVerificationTokenHash: tokenHash,
      phoneVerificationExpiresAt: expiresAt,
      phoneVerificationAttemptCount: 0,
    },
  });

  return rawCode;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export async function clearPhoneVerificationChallenge(userId) {
  await UserModel.findByIdAndUpdate(userId, {
    $unset: {
      pendingPhoneNumber: "",
      phoneVerificationTokenHash: "",
      phoneVerificationExpiresAt: "",
    },
    $set: {
      phoneVerificationAttemptCount: 0,
    },
  });
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {string} phoneNumber
 */
export async function markUserPhoneVerified(userId, phoneNumber) {
  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      userPhoneNumber: phoneNumber,
      isPhoneVerified: true,
      phoneVerificationAttemptCount: 0,
    },
    $unset: {
      pendingPhoneNumber: "",
      phoneVerificationTokenHash: "",
      phoneVerificationExpiresAt: "",
    },
  });
}

/**
 * Запрос SMS для привязки/подтверждения телефона (auth).
 *
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {string | null | undefined} rawPhone — если пусто, берём текущий userPhoneNumber
 */
export async function requestPhoneBindForUser(userId, rawPhone) {
  const user = await UserModel.findById(userId).select(
    "userPhoneNumber isPhoneVerified",
  );
  if (!user) {
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const phoneNumber =
    rawPhone != null && String(rawPhone).trim() !== ""
      ? String(rawPhone).trim()
      : user.userPhoneNumber != null
        ? String(user.userPhoneNumber).trim()
        : "";

  if (!phoneNumber) {
    throw new Error(PHONE_NOT_SET_MESSAGE);
  }

  if (
    user.isPhoneVerified === true &&
    user.userPhoneNumber === phoneNumber &&
    (rawPhone == null || String(rawPhone).trim() === "")
  ) {
    throw new Error(PHONE_VERIFICATION_ALREADY_VERIFIED_MESSAGE);
  }

  const taken = await UserModel.findOne({
    userPhoneNumber: phoneNumber,
    _id: { $ne: user._id },
  }).select("_id");
  if (taken) {
    throw new Error(PHONE_TAKEN_MESSAGE);
  }

  const code = await issuePhoneVerificationCode(user._id, phoneNumber);
  await deliverPhoneVerificationSms({ phoneNumber, code });

  return { phoneNumber };
}

/**
 * Подтверждение привязки телефона кодом.
 *
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {unknown} rawCode
 */
export async function confirmPhoneBindForUser(userId, rawCode) {
  const code = String(rawCode ?? "").trim();
  if (!PHONE_CODE_PATTERN.test(code)) {
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const user = await UserModel.findById(userId).select(
    "+phoneVerificationTokenHash +phoneVerificationExpiresAt +phoneVerificationAttemptCount +pendingPhoneNumber userPhoneNumber",
  );
  if (!user) {
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  if ((user.phoneVerificationAttemptCount ?? 0) >= PHONE_VERIFICATION_MAX_ATTEMPTS) {
    throw new Error(PHONE_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE);
  }

  const now = new Date();
  if (!user.phoneVerificationExpiresAt || user.phoneVerificationExpiresAt <= now) {
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const phoneNumber = String(user.pendingPhoneNumber ?? "").trim();
  if (!phoneNumber) {
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  if (user.phoneVerificationTokenHash !== hashPhoneVerificationSecret(code)) {
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { phoneVerificationAttemptCount: 1 },
    });
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const taken = await UserModel.findOne({
    userPhoneNumber: phoneNumber,
    _id: { $ne: user._id },
  }).select("_id");
  if (taken) {
    await clearPhoneVerificationChallenge(userId);
    throw new Error(PHONE_TAKEN_MESSAGE);
  }

  await markUserPhoneVerified(userId, phoneNumber);
  return { phoneNumber };
}

/**
 * SMS-код для входа (пользователь должен существовать).
 * При отсутствии номера — тихий no-op (anti-enumeration), без SMS.
 *
 * @param {string} phoneNumber E.164
 * @returns {Promise<{ sent: boolean }>}
 */
export async function requestPhoneLoginOtp(phoneNumber) {
  const user = await UserModel.findOne({ userPhoneNumber: phoneNumber }).select(
    "_id isBlockedUser isActiveUser",
  );

  if (!user || user.isBlockedUser || user.isActiveUser === false) {
    return { sent: false };
  }

  const code = await issuePhoneVerificationCode(user._id, phoneNumber);
  try {
    await deliverPhoneVerificationSms({ phoneNumber, code });
  } catch (error) {
    await clearPhoneVerificationChallenge(user._id);
    throw error;
  }

  return { sent: true };
}

/**
 * Вход по SMS-коду. Успех → isPhoneVerified=true.
 *
 * @param {string} phoneNumber
 * @param {unknown} rawCode
 * @returns {Promise<import('mongoose').Document>}
 */
export async function confirmPhoneLoginOtp(phoneNumber, rawCode) {
  const code = String(rawCode ?? "").trim();
  if (!PHONE_CODE_PATTERN.test(code)) {
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const user = await UserModel.findOne({ userPhoneNumber: phoneNumber }).select(
    "+phoneVerificationTokenHash +phoneVerificationExpiresAt +phoneVerificationAttemptCount +pendingPhoneNumber +authTokenVersion +passwordHash isBlockedUser isActiveUser isPhoneVerified",
  );

  if (!user) {
    // Константный «промах» без утечки существования номера
    crypto.randomBytes(8);
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  if (user.isBlockedUser) {
    throw new Error("Аккаунт заблокирован");
  }
  if (user.isActiveUser === false) {
    throw new Error("Аккаунт отключён администратором");
  }

  if ((user.phoneVerificationAttemptCount ?? 0) >= PHONE_VERIFICATION_MAX_ATTEMPTS) {
    throw new Error(PHONE_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE);
  }

  const now = new Date();
  if (!user.phoneVerificationExpiresAt || user.phoneVerificationExpiresAt <= now) {
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const pendingPhone = String(user.pendingPhoneNumber ?? "").trim();
  if (pendingPhone && pendingPhone !== phoneNumber) {
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  if (user.phoneVerificationTokenHash !== hashPhoneVerificationSecret(code)) {
    await UserModel.findByIdAndUpdate(user._id, {
      $inc: { phoneVerificationAttemptCount: 1 },
    });
    throw new Error(PHONE_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  await markUserPhoneVerified(user._id, phoneNumber);
  user.isPhoneVerified = true;
  user.userLastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  logServerEvent("info", {
    event: "phone_otp_login",
    userId: String(user._id),
  });

  return user;
}
