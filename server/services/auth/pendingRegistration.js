import { PendingRegistrationModel, UserModel } from "../../models/index.js";
import {
  EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE,
  EMAIL_VERIFICATION_CODE_LENGTH,
  EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
  EMAIL_VERIFICATION_MAX_ATTEMPTS,
  PENDING_REGISTRATION_NOT_FOUND_MESSAGE,
  PENDING_REGISTRATION_TAKEN_MESSAGE,
  PENDING_REGISTRATION_TTL_MS,
} from "../../constants/emailVerificationConstants.js";
import {
  deliverEmailVerification,
  generateEmailVerificationCode,
  hashEmailVerificationSecret,
} from "./emailVerification.js";
import { deliverPhoneVerificationSms } from "./phoneVerification.js";
import {
  PHONE_VERIFICATION_TOKEN_TTL_MS,
  SMS_DELIVERY_UNAVAILABLE_MESSAGE,
} from "../../constants/phoneVerificationConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { attachReferralAttribution } from "../referral/attachReferralAttribution.js";
import { ensureUserReferralCode } from "../referral/ensureUserReferralCode.js";

const PENDING_CODE_PATTERN = new RegExp(`^\\d{${EMAIL_VERIFICATION_CODE_LENGTH}}$`);

/**
 * Условия занятости email/userName/телефона среди реальных пользователей.
 * Pending-заявки намеренно не участвуют: до подтверждения почты ник
 * и email никем не заняты.
 *
 * @param {{ email: string; userName: string; userPhoneNumber?: string | null }} params
 */
function buildTakenConditions({ email, userName, userPhoneNumber }) {
  const orConditions = [{ userName }];
  if (email != null && email !== "") {
    orConditions.push({ email });
  }
  if (userPhoneNumber != null && userPhoneNumber !== "") {
    orConditions.push({ userPhoneNumber });
  }
  return orConditions;
}

/**
 * Создаёт (или заменяет по email) заявку на регистрацию и отправляет код.
 *
 * @param {{
 *   email: string;
 *   passwordHash: string;
 *   userName: string;
 *   userPhoneNumber?: string | null;
 *   userAvatarUrl: string;
 *   userBackgroundUrl: string;
 *   userBirthDate?: Date | null;
 *   userGender?: string | null;
 *   notificationsEnabled?: boolean | null;
 *   userAddress?: string;
 *   userAddressFlat?: string;
 *   userAddressFiasId?: string;
 *   userAddressGeo?: { lat: number; lon: number } | null;
 *   referralCode?: string | null;
 * }} fields
 * @returns {Promise<{ registrationId: string; email: string }>}
 */
export async function createPendingRegistration(fields) {
  const email = String(fields.email).trim().toLowerCase();

  const exists = await UserModel.findOne({
    $or: buildTakenConditions({
      email,
      userName: fields.userName,
      userPhoneNumber: fields.userPhoneNumber,
    }),
  }).select("_id");
  if (exists) {
    throw new Error(PENDING_REGISTRATION_TAKEN_MESSAGE);
  }

  const code = generateEmailVerificationCode();
  const codeHash = hashEmailVerificationSecret(code);
  const expiresAt = new Date(Date.now() + PENDING_REGISTRATION_TTL_MS);

  const referralCodeRaw = String(fields.referralCode ?? "")
    .trim()
    .toUpperCase();
  const referralCode = referralCodeRaw || null;

  const pending = await PendingRegistrationModel.findOneAndUpdate(
    { email },
    {
      $set: {
        ...fields,
        channel: "email",
        email,
        referralCode,
        codeHash,
        codeAttemptCount: 0,
        expiresAt,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await deliverEmailVerification({ email, userName: fields.userName, code });

  return { registrationId: String(pending._id), email };
}

/**
 * Заявка на регистрацию по телефону + SMS-код.
 *
 * @param {{
 *   userPhoneNumber: string;
 *   passwordHash: string;
 *   userName: string;
 *   userAvatarUrl: string;
 *   userBackgroundUrl: string;
 *   userBirthDate?: Date | null;
 *   userGender?: string | null;
 *   notificationsEnabled?: boolean | null;
 *   userAddress?: string;
 *   userAddressFlat?: string;
 *   userAddressFiasId?: string;
 *   userAddressGeo?: { lat: number; lon: number } | null;
 *   referralCode?: string | null;
 * }} fields
 * @returns {Promise<{ registrationId: string; phoneNumber: string }>}
 */
export async function createPendingPhoneRegistration(fields) {
  const userPhoneNumber = String(fields.userPhoneNumber).trim();

  const exists = await UserModel.findOne({
    $or: buildTakenConditions({
      email: null,
      userName: fields.userName,
      userPhoneNumber,
    }),
  }).select("_id");
  if (exists) {
    throw new Error(PENDING_REGISTRATION_TAKEN_MESSAGE);
  }

  const code = generateEmailVerificationCode();
  const codeHash = hashEmailVerificationSecret(code);
  const expiresAt = new Date(Date.now() + PHONE_VERIFICATION_TOKEN_TTL_MS);

  const referralCodeRaw = String(fields.referralCode ?? "")
    .trim()
    .toUpperCase();
  const referralCode = referralCodeRaw || null;

  const pending = await PendingRegistrationModel.findOneAndUpdate(
    { userPhoneNumber },
    {
      $set: {
        ...fields,
        channel: "phone",
        userPhoneNumber,
        email: undefined,
        referralCode,
        codeHash,
        codeAttemptCount: 0,
        expiresAt,
      },
      $unset: { email: "" },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await deliverPhoneVerificationSms({ phoneNumber: userPhoneNumber, code });

  return { registrationId: String(pending._id), phoneNumber: userPhoneNumber };
}

/**
 * Повторно отправляет код по существующей заявке (email или SMS).
 *
 * @param {string} registrationId
 * @returns {Promise<{ email?: string; phoneNumber?: string }>}
 */
export async function resendPendingRegistrationCode(registrationId) {
  const pending = await PendingRegistrationModel.findById(registrationId);
  if (!pending || pending.expiresAt <= new Date()) {
    throw new Error(PENDING_REGISTRATION_NOT_FOUND_MESSAGE);
  }

  const isPhoneChannel =
    pending.channel === "phone" ||
    (!pending.email &&
      pending.userPhoneNumber != null &&
      pending.userPhoneNumber !== "");

  const code = generateEmailVerificationCode();
  pending.codeHash = hashEmailVerificationSecret(code);
  pending.codeAttemptCount = 0;
  pending.expiresAt = new Date(
    Date.now() +
      (isPhoneChannel ? PHONE_VERIFICATION_TOKEN_TTL_MS : PENDING_REGISTRATION_TTL_MS),
  );
  await pending.save();

  if (isPhoneChannel) {
    const phoneNumber = String(pending.userPhoneNumber).trim();
    try {
      await deliverPhoneVerificationSms({ phoneNumber, code });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message === SMS_DELIVERY_UNAVAILABLE_MESSAGE ||
        message === "SMS_DELIVERY_UNAVAILABLE"
      ) {
        throw new Error("SMS_DELIVERY_UNAVAILABLE");
      }
      throw error;
    }
    return { phoneNumber };
  }

  await deliverEmailVerification({
    email: pending.email,
    userName: pending.userName,
    code,
  });

  return { email: pending.email };
}

/**
 * Проверяет код и только здесь создаёт настоящий аккаунт.
 *
 * @param {string} registrationId
 * @param {unknown} rawCode
 * @returns {Promise<import('mongoose').Document>} созданный пользователь
 */
export async function confirmPendingRegistration(registrationId, rawCode) {
  const code = String(rawCode ?? "").trim();
  if (!PENDING_CODE_PATTERN.test(code)) {
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const pending = await PendingRegistrationModel.findById(registrationId).select(
    "+passwordHash +codeHash",
  );
  if (!pending || pending.expiresAt <= new Date()) {
    throw new Error(PENDING_REGISTRATION_NOT_FOUND_MESSAGE);
  }

  if ((pending.codeAttemptCount ?? 0) >= EMAIL_VERIFICATION_MAX_ATTEMPTS) {
    throw new Error(EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE);
  }

  if (pending.codeHash !== hashEmailVerificationSecret(code)) {
    await PendingRegistrationModel.findByIdAndUpdate(pending._id, {
      $inc: { codeAttemptCount: 1 },
    });
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  // Пока заявка ждала подтверждения, email/ник/телефон мог занять другой
  // подтвердившийся пользователь — заявки друг друга не блокируют.
  const exists = await UserModel.findOne({
    $or: buildTakenConditions(pending),
  }).select("_id");
  if (exists) {
    await PendingRegistrationModel.findByIdAndDelete(pending._id);
    throw new Error(PENDING_REGISTRATION_TAKEN_MESSAGE);
  }

  const isPhoneChannel =
    pending.channel === "phone" ||
    (!pending.email &&
      pending.userPhoneNumber != null &&
      pending.userPhoneNumber !== "");

  const phone =
    pending.userPhoneNumber != null && pending.userPhoneNumber !== ""
      ? pending.userPhoneNumber
      : undefined;

  const doc = new UserModel({
    ...(pending.email ? { email: pending.email } : {}),
    passwordHash: pending.passwordHash,
    userName: pending.userName,
    ...(phone ? { userPhoneNumber: phone } : {}),
    userAvatarUrl: pending.userAvatarUrl,
    userBackgroundUrl: pending.userBackgroundUrl,
    isEmailVerified: !isPhoneChannel && Boolean(pending.email),
    isPhoneVerified: Boolean(isPhoneChannel && phone),
    ...(pending.userBirthDate ? { userBirthDate: pending.userBirthDate } : {}),
    ...(pending.userGender ? { userGender: pending.userGender } : {}),
    ...(typeof pending.notificationsEnabled === "boolean"
      ? { notificationsEnabled: pending.notificationsEnabled }
      : {}),
    ...(pending.userAddress
      ? {
          userAddress: pending.userAddress,
          userAddressFlat: pending.userAddressFlat,
          userAddressFiasId: pending.userAddressFiasId,
          userAddressGeo: pending.userAddressGeo,
        }
      : {}),
  });

  let user;
  try {
    user = await doc.save();
  } catch (saveError) {
    // гонка: между проверкой и save() кто-то успел занять email/ник
    if (saveError?.code === 11000) {
      await PendingRegistrationModel.findByIdAndDelete(pending._id);
      throw new Error(PENDING_REGISTRATION_TAKEN_MESSAGE);
    }
    throw saveError;
  }

  await PendingRegistrationModel.findByIdAndDelete(pending._id);

  // Аккаунт уже создан — attribution/code не должны откатывать confirm.
  try {
    if (pending.referralCode) {
      await attachReferralAttribution({
        userId: String(user._id),
        referralCode: pending.referralCode,
      });
    }
    await ensureUserReferralCode(String(user._id));
  } catch (error) {
    logServerEvent("error", {
      event: "referral_post_registration_failed",
      userId: String(user._id),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    const { emitUserRegisteredEvent } = await import(
      "../analytics-events/emitAnalyticsEvents.js"
    );
    emitUserRegisteredEvent({
      userId: String(user._id),
      channel: isPhoneChannel ? "phone" : "email",
    });
  } catch {
    // analytics must not block registration
  }

  return user;
}
