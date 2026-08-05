import crypto from "crypto";

import { UserModel } from "../../models/index.js";
import {
  EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE,
  EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE,
  EMAIL_VERIFICATION_CODE_LENGTH,
  EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
  EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE,
  EMAIL_VERIFICATION_MAX_ATTEMPTS,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  EMAIL_NOT_SET_MESSAGE,
  EMAIL_TAKEN_MESSAGE,
} from "../../constants/emailVerificationConstants.js";
import { EMAIL_VERIFICATION_SUBJECT } from "../../constants/smtpConstants.js";
import { isSmtpConfigured, sendSmtpMail } from "../../utils/smtpMail.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

const EMAIL_VERIFICATION_CODE_PATTERN = new RegExp(
  `^\\d{${EMAIL_VERIFICATION_CODE_LENGTH}}$`,
);

/** Высокоэнтропийный токен ссылки: 32 байта hex (см. verifyEmailTokenQuerySchema). */
const EMAIL_VERIFICATION_LINK_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

export const hashEmailVerificationSecret = (rawSecret) =>
  crypto.createHash("sha256").update(String(rawSecret)).digest("hex");

export const generateEmailVerificationCode = () =>
  String(
    crypto.randomInt(
      10 ** (EMAIL_VERIFICATION_CODE_LENGTH - 1),
      10 ** EMAIL_VERIFICATION_CODE_LENGTH,
    ),
  );

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @returns {Promise<string>} raw 6-digit code for email
 */
export const issueEmailVerificationCode = async (userId) => {
  const rawCode = generateEmailVerificationCode();
  const tokenHash = hashEmailVerificationSecret(rawCode);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS);

  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
      emailVerificationAttemptCount: 0,
    },
    $unset: {
      pendingEmail: "",
    },
  });

  return rawCode;
};

/**
 * Код для привязки/смены email (пишется в `pendingEmail`).
 *
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {string} email
 * @returns {Promise<string>}
 */
export const issueEmailBindCode = async (userId, email) => {
  const rawCode = generateEmailVerificationCode();
  const tokenHash = hashEmailVerificationSecret(rawCode);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS);
  const normalized = String(email).trim().toLowerCase();

  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      pendingEmail: normalized,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
      emailVerificationAttemptCount: 0,
    },
  });

  return rawCode;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export const clearEmailVerificationToken = async (userId) => {
  await UserModel.findByIdAndUpdate(userId, {
    $unset: {
      emailVerificationTokenHash: "",
      emailVerificationExpiresAt: "",
      pendingEmail: "",
    },
    $set: {
      emailVerificationAttemptCount: 0,
    },
  });
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export const markUserEmailVerified = async (userId) => {
  const user = await UserModel.findById(userId).select("+pendingEmail");
  const pending = String(user?.pendingEmail ?? "")
    .trim()
    .toLowerCase();
  /** @type {Record<string, unknown>} */
  const $set = { isEmailVerified: true, emailVerificationAttemptCount: 0 };
  if (pending) {
    $set.email = pending;
  }

  await UserModel.findByIdAndUpdate(userId, {
    $set,
    $unset: {
      emailVerificationTokenHash: "",
      emailVerificationExpiresAt: "",
      pendingEmail: "",
    },
  });
};

/**
 * @param {unknown} rawToken
 */
export const verifyEmailByToken = async (rawToken) => {
  const token = String(rawToken ?? "").trim();
  if (!token) {
    throw new Error(EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE);
  }

  // Этот путь — неаутентифицированный GET без счётчика попыток, поэтому
  // принимаем только высокоэнтропийный токен ссылки.
  // Иначе сюда подошёл бы 6-значный код из письма: пространство 10^6 при
  // общем лимите 50k запросов/15 мин с IP брутфорсится за часы, и любой
  // ожидающий подтверждения email можно было подтвердить без доступа к почте.
  if (!EMAIL_VERIFICATION_LINK_TOKEN_PATTERN.test(token)) {
    throw new Error(EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE);
  }

  const tokenHash = hashEmailVerificationSecret(token);
  const now = new Date();

  const user = await UserModel.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: now },
  }).select("_id isEmailVerified email");

  if (!user) {
    throw new Error(EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE);
  }

  if (user.isEmailVerified === true) {
    await clearEmailVerificationToken(user._id);
    return user;
  }

  await markUserEmailVerified(user._id);
  return user;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {unknown} rawCode
 */
export const verifyEmailByCodeForUser = async (userId, rawCode) => {
  const code = String(rawCode ?? "").trim();
  if (!EMAIL_VERIFICATION_CODE_PATTERN.test(code)) {
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const user = await UserModel.findById(userId).select(
    "isEmailVerified emailVerificationTokenHash emailVerificationExpiresAt emailVerificationAttemptCount",
  );

  if (!user) {
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  if (user.isEmailVerified === true) {
    await clearEmailVerificationToken(user._id);
    return user;
  }

  if ((user.emailVerificationAttemptCount ?? 0) >= EMAIL_VERIFICATION_MAX_ATTEMPTS) {
    throw new Error(EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE);
  }

  const now = new Date();
  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt <= now) {
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const codeHash = hashEmailVerificationSecret(code);
  if (user.emailVerificationTokenHash !== codeHash) {
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { emailVerificationAttemptCount: 1 },
    });
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  await markUserEmailVerified(userId);
  return user;
};

/**
 * @param {{ email: string; userName?: string; code: string }} params
 */
export const deliverEmailVerification = async ({ email, userName, code }) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isSmtpConfigured()) {
    if (isProduction) {
      throw new Error("EMAIL_DELIVERY_UNAVAILABLE");
    }
    logServerEvent("info", {
      event: "email_verify_dev_code",
      email,
      userName: userName ?? null,
      code,
    });
    return;
  }

  try {
    const greeting = userName ? `Здравствуйте, ${userName}!` : "Здравствуйте!";
    const text = `${greeting}\n\nКод подтверждения email: ${code}\n\nКод действует 24 часа.`;
    await sendSmtpMail({
      to: email,
      subject: EMAIL_VERIFICATION_SUBJECT,
      text,
      html: `<p>${greeting}</p><p>Код подтверждения email:</p><p><strong>${code}</strong></p><p>Код действует 24 часа.</p>`,
    });
    logServerEvent("info", { event: "email_verify_sent", email });
  } catch (error) {
    logServerEvent("error", {
      event: "smtp_send",
      error: error instanceof Error ? error.message : String(error),
    });
    if (isProduction) {
      throw new Error("EMAIL_DELIVERY_UNAVAILABLE");
    }
    logServerEvent("info", { event: "email_verify_fallback_code", email, code });
  }
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export const sendEmailVerificationForUser = async (userId) => {
  const user = await UserModel.findById(userId)
    .select("email userName isEmailVerified")
    .lean();

  if (!user?.email) {
    throw new Error("У пользователя нет email");
  }
  if (user.isEmailVerified === true) {
    throw new Error(EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE);
  }

  const code = await issueEmailVerificationCode(userId);
  await deliverEmailVerification({
    email: user.email,
    userName: user.userName,
    code,
  });

  return { email: user.email };
};

/**
 * Запрос кода для привязки/смены email (auth).
 *
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {string} rawEmail
 */
export async function requestEmailBindForUser(userId, rawEmail) {
  const email = String(rawEmail ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    throw new Error(EMAIL_NOT_SET_MESSAGE);
  }

  const user = await UserModel.findById(userId).select("email isEmailVerified userName");
  if (!user) {
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const currentEmail = String(user.email ?? "")
    .trim()
    .toLowerCase();
  if (user.isEmailVerified === true && currentEmail === email) {
    throw new Error(EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE);
  }

  const taken = await UserModel.findOne({
    email,
    _id: { $ne: user._id },
  }).select("_id");
  if (taken) {
    throw new Error(EMAIL_TAKEN_MESSAGE);
  }

  const code = await issueEmailBindCode(user._id, email);
  try {
    await deliverEmailVerification({
      email,
      userName: user.userName,
      code,
    });
  } catch (error) {
    await clearEmailVerificationToken(user._id);
    throw error;
  }

  return { email };
}

/**
 * Подтверждение привязки/смены email кодом.
 *
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {unknown} rawCode
 */
export async function confirmEmailBindForUser(userId, rawCode) {
  const code = String(rawCode ?? "").trim();
  if (!EMAIL_VERIFICATION_CODE_PATTERN.test(code)) {
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const user = await UserModel.findById(userId).select(
    "+emailVerificationTokenHash +emailVerificationExpiresAt +emailVerificationAttemptCount +pendingEmail email",
  );
  if (!user) {
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  if ((user.emailVerificationAttemptCount ?? 0) >= EMAIL_VERIFICATION_MAX_ATTEMPTS) {
    throw new Error(EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE);
  }

  const now = new Date();
  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt <= now) {
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const pending = String(user.pendingEmail ?? "")
    .trim()
    .toLowerCase();
  if (!pending) {
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  if (user.emailVerificationTokenHash !== hashEmailVerificationSecret(code)) {
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { emailVerificationAttemptCount: 1 },
    });
    throw new Error(EMAIL_VERIFICATION_INVALID_CODE_MESSAGE);
  }

  const taken = await UserModel.findOne({
    email: pending,
    _id: { $ne: user._id },
  }).select("_id");
  if (taken) {
    await clearEmailVerificationToken(userId);
    throw new Error(EMAIL_TAKEN_MESSAGE);
  }

  await markUserEmailVerified(userId);
  return { email: pending };
}
