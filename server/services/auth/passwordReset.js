import bcrypt from "bcrypt";
import crypto from "crypto";

import { UserModel } from "../../models/index.js";
import {
  PASSWORD_CHANGE_INVALID_CURRENT_MESSAGE,
  PASSWORD_CHANGE_NO_PASSWORD_MESSAGE,
  PASSWORD_RESET_ATTEMPTS_EXCEEDED_MESSAGE,
  PASSWORD_RESET_CODE_LENGTH,
  PASSWORD_RESET_EMAIL_SUBJECT,
  PASSWORD_RESET_INVALID_CODE_MESSAGE,
  PASSWORD_RESET_MAX_ATTEMPTS,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from "../../constants/passwordResetConstants.js";
import { isSmtpConfigured, sendSmtpMail } from "../../utils/smtpMail.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  generateEmailVerificationCode,
  hashEmailVerificationSecret,
} from "./emailVerification.js";
import { deliverPhoneVerificationSms } from "./phoneVerification.js";
import { bumpUserAuthTokenVersion } from "./userAuthTokenVersion.js";

const PASSWORD_RESET_CODE_PATTERN = new RegExp(`^\\d{${PASSWORD_RESET_CODE_LENGTH}}$`);

const RESET_SELECT =
  "+passwordResetTokenHash +passwordResetExpiresAt +passwordResetAttemptCount +passwordHash +authTokenVersion";

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @returns {Promise<string>} raw code
 */
export async function issuePasswordResetCode(userId) {
  const rawCode = generateEmailVerificationCode();
  const tokenHash = hashEmailVerificationSecret(rawCode);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
      passwordResetAttemptCount: 0,
    },
  });

  return rawCode;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export async function clearPasswordResetChallenge(userId) {
  await UserModel.findByIdAndUpdate(userId, {
    $unset: {
      passwordResetTokenHash: "",
      passwordResetExpiresAt: "",
    },
    $set: {
      passwordResetAttemptCount: 0,
    },
  });
}

/**
 * @param {{ email: string; userName?: string; code: string }} params
 */
export async function deliverPasswordResetEmail({ email, userName, code }) {
  const isProduction = process.env.NODE_ENV === "production";
  const ttlMinutes = Math.round(PASSWORD_RESET_TOKEN_TTL_MS / 60_000);

  if (!isSmtpConfigured()) {
    if (isProduction) {
      throw new Error("EMAIL_DELIVERY_UNAVAILABLE");
    }
    logServerEvent("info", {
      event: "password_reset_dev_code",
      email,
      userName: userName ?? null,
      code,
    });
    return;
  }

  try {
    const greeting = userName ? `Здравствуйте, ${userName}!` : "Здравствуйте!";
    const text = `${greeting}\n\nКод сброса пароля: ${code}\n\nКод действует ${ttlMinutes} мин.`;
    await sendSmtpMail({
      to: email,
      subject: PASSWORD_RESET_EMAIL_SUBJECT,
      text,
      html: `<p>${greeting}</p><p>Код сброса пароля:</p><p><strong>${code}</strong></p><p>Код действует ${ttlMinutes} мин.</p>`,
    });
    logServerEvent("info", { event: "password_reset_email_sent", email });
  } catch (error) {
    logServerEvent("error", {
      event: "smtp_send_password_reset",
      error: error instanceof Error ? error.message : String(error),
    });
    if (isProduction) {
      throw new Error("EMAIL_DELIVERY_UNAVAILABLE");
    }
    logServerEvent("info", {
      event: "password_reset_fallback_code",
      email,
      code,
    });
  }
}

/**
 * Anti-enumeration: тихий no-op, если нет verified контакта / аккаунт недоступен.
 *
 * @param {{ email?: string; phoneNumber?: string }} params
 * @returns {Promise<{ sent: boolean }>}
 */
export async function requestPasswordReset({ email, phoneNumber }) {
  const normalizedEmail =
    email != null && String(email).trim() !== ""
      ? String(email).trim().toLowerCase()
      : "";
  const normalizedPhone =
    phoneNumber != null && String(phoneNumber).trim() !== ""
      ? String(phoneNumber).trim()
      : "";

  /** @type {import('mongoose').Document | null} */
  let user = null;
  if (normalizedEmail) {
    user = await UserModel.findOne({
      email: normalizedEmail,
      isEmailVerified: true,
    }).select("_id email userName isBlockedUser isActiveUser");
  } else if (normalizedPhone) {
    user = await UserModel.findOne({
      userPhoneNumber: normalizedPhone,
      isPhoneVerified: true,
    }).select("_id userPhoneNumber userName isBlockedUser isActiveUser");
  }

  if (!user || user.isBlockedUser || user.isActiveUser === false) {
    return { sent: false };
  }

  const code = await issuePasswordResetCode(user._id);
  try {
    if (normalizedEmail) {
      await deliverPasswordResetEmail({
        email: normalizedEmail,
        userName: user.userName,
        code,
      });
    } else {
      await deliverPhoneVerificationSms({
        phoneNumber: normalizedPhone,
        code,
      });
    }
  } catch (error) {
    await clearPasswordResetChallenge(user._id);
    throw error;
  }

  return { sent: true };
}

/**
 * @param {import('mongoose').Document} user
 * @param {unknown} rawCode
 */
async function assertValidPasswordResetCode(user, rawCode) {
  const code = String(rawCode ?? "").trim();
  if (!PASSWORD_RESET_CODE_PATTERN.test(code)) {
    throw new Error(PASSWORD_RESET_INVALID_CODE_MESSAGE);
  }

  if ((user.passwordResetAttemptCount ?? 0) >= PASSWORD_RESET_MAX_ATTEMPTS) {
    throw new Error(PASSWORD_RESET_ATTEMPTS_EXCEEDED_MESSAGE);
  }

  const now = new Date();
  if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt <= now) {
    throw new Error(PASSWORD_RESET_INVALID_CODE_MESSAGE);
  }

  if (user.passwordResetTokenHash !== hashEmailVerificationSecret(code)) {
    await UserModel.findByIdAndUpdate(user._id, {
      $inc: { passwordResetAttemptCount: 1 },
    });
    throw new Error(PASSWORD_RESET_INVALID_CODE_MESSAGE);
  }
}

/**
 * @param {{ email?: string; phoneNumber?: string; code: unknown; newPassword: string }} params
 */
export async function confirmPasswordReset({ email, phoneNumber, code, newPassword }) {
  const normalizedEmail =
    email != null && String(email).trim() !== ""
      ? String(email).trim().toLowerCase()
      : "";
  const normalizedPhone =
    phoneNumber != null && String(phoneNumber).trim() !== ""
      ? String(phoneNumber).trim()
      : "";

  /** @type {import('mongoose').Document | null} */
  let user = null;
  if (normalizedEmail) {
    user = await UserModel.findOne({
      email: normalizedEmail,
      isEmailVerified: true,
    }).select(RESET_SELECT);
  } else if (normalizedPhone) {
    user = await UserModel.findOne({
      userPhoneNumber: normalizedPhone,
      isPhoneVerified: true,
    }).select(RESET_SELECT);
  }

  if (!user) {
    crypto.randomBytes(8);
    throw new Error(PASSWORD_RESET_INVALID_CODE_MESSAGE);
  }

  if (user.isBlockedUser) {
    throw new Error("Аккаунт заблокирован");
  }
  if (user.isActiveUser === false) {
    throw new Error("Аккаунт отключён администратором");
  }

  await assertValidPasswordResetCode(user, code);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await UserModel.findByIdAndUpdate(user._id, {
    $set: {
      passwordHash,
      passwordResetAttemptCount: 0,
    },
    $unset: {
      passwordResetTokenHash: "",
      passwordResetExpiresAt: "",
    },
  });

  await bumpUserAuthTokenVersion(String(user._id));

  logServerEvent("info", {
    event: "password_reset_success",
    userId: String(user._id),
    channel: normalizedEmail ? "email" : "phone",
  });

  return { userId: String(user._id) };
}

/**
 * Смена пароля залогиненным пользователем.
 *
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {{ currentPassword: string; newPassword: string }} params
 * @returns {Promise<import('mongoose').Document>}
 */
export async function changePasswordForUser(userId, { currentPassword, newPassword }) {
  const user = await UserModel.findById(userId).select(
    "+passwordHash +authTokenVersion +passwordResetTokenHash +passwordResetExpiresAt",
  );
  if (!user) {
    throw new Error(PASSWORD_CHANGE_INVALID_CURRENT_MESSAGE);
  }

  if (!user.passwordHash) {
    throw new Error(PASSWORD_CHANGE_NO_PASSWORD_MESSAGE);
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error(PASSWORD_CHANGE_INVALID_CURRENT_MESSAGE);
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save({ validateBeforeSave: false });

  await clearPasswordResetChallenge(user._id);

  logServerEvent("info", {
    event: "password_change_success",
    userId: String(user._id),
  });

  return user;
}
