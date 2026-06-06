import crypto from "crypto";

import { UserModel } from "../models/index.js";
import {
  EMAIL_VERIFICATION_ALREADY_VERIFIED_MESSAGE,
  EMAIL_VERIFICATION_ATTEMPTS_EXCEEDED_MESSAGE,
  EMAIL_VERIFICATION_CODE_LENGTH,
  EMAIL_VERIFICATION_INVALID_CODE_MESSAGE,
  EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE,
  EMAIL_VERIFICATION_MAX_ATTEMPTS,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
} from "../constants/emailVerificationConstants.js";
import { EMAIL_VERIFICATION_SUBJECT } from "../constants/smtpConstants.js";
import { isSmtpConfigured, sendSmtpMail } from "./smtpMail.js";

const EMAIL_VERIFICATION_CODE_PATTERN = new RegExp(`^\\d{${EMAIL_VERIFICATION_CODE_LENGTH}}$`);

const hashEmailVerificationSecret = (rawSecret) =>
  crypto.createHash("sha256").update(String(rawSecret)).digest("hex");

export const generateEmailVerificationToken = () =>
  crypto.randomBytes(32).toString("hex");

export const generateEmailVerificationCode = () =>
  String(crypto.randomInt(10 ** (EMAIL_VERIFICATION_CODE_LENGTH - 1), 10 ** EMAIL_VERIFICATION_CODE_LENGTH));

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
  await UserModel.findByIdAndUpdate(userId, {
    $set: { isEmailVerified: true, emailVerificationAttemptCount: 0 },
    $unset: {
      emailVerificationTokenHash: "",
      emailVerificationExpiresAt: "",
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
  if (isSmtpConfigured()) {
    try {
      const greeting = userName ? `Здравствуйте, ${userName}!` : "Здравствуйте!";
      const text = `${greeting}\n\nКод подтверждения email: ${code}\n\nКод действует 24 часа.`;
      await sendSmtpMail({
        to: email,
        subject: EMAIL_VERIFICATION_SUBJECT,
        text,
        html: `<p>${greeting}</p><p>Код подтверждения email:</p><p><strong>${code}</strong></p><p>Код действует 24 часа.</p>`,
      });
      console.info(`[email-verify] Письмо с кодом отправлено на ${email}`);
      return;
    } catch (error) {
      console.error("[email-verify] SMTP send error:", error);
      console.info(`[email-verify] Fallback код для ${email}:`, code);
      return;
    }
  }

  console.info(
    `[email-verify] Код для ${email}${userName ? ` (${userName})` : ""}:`,
    code,
  );
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
