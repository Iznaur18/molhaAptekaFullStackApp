import crypto from 'crypto';

import { UserModel } from '../models/index.js';
import {
    EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE,
    EMAIL_VERIFICATION_TOKEN_TTL_MS,
} from '../constants/emailVerificationConstants.js';
import { EMAIL_VERIFICATION_SUBJECT } from '../constants/smtpConstants.js';
import { isSmtpConfigured, sendSmtpMail } from './smtpMail.js';

const hashEmailVerificationToken = (rawToken) =>
    crypto.createHash('sha256').update(String(rawToken)).digest('hex');

export const generateEmailVerificationToken = () =>
    crypto.randomBytes(32).toString('hex');

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @returns {Promise<string>} raw token for link
 */
export const issueEmailVerificationToken = async (userId) => {
    const rawToken = generateEmailVerificationToken();
    const tokenHash = hashEmailVerificationToken(rawToken);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS);

    await UserModel.findByIdAndUpdate(userId, {
        $set: {
            emailVerificationTokenHash: tokenHash,
            emailVerificationExpiresAt: expiresAt,
        },
    });

    return rawToken;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export const clearEmailVerificationToken = async (userId) => {
    await UserModel.findByIdAndUpdate(userId, {
        $unset: {
            emailVerificationTokenHash: '',
            emailVerificationExpiresAt: '',
        },
    });
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export const markUserEmailVerified = async (userId) => {
    await UserModel.findByIdAndUpdate(userId, {
        $set: { isEmailVerified: true },
        $unset: {
            emailVerificationTokenHash: '',
            emailVerificationExpiresAt: '',
        },
    });
};

/**
 * @param {unknown} rawToken
 */
export const verifyEmailByToken = async (rawToken) => {
    const token = String(rawToken ?? '').trim();
    if (!token) {
        throw new Error(EMAIL_VERIFICATION_INVALID_TOKEN_MESSAGE);
    }

    const tokenHash = hashEmailVerificationToken(token);
    const now = new Date();

    const user = await UserModel.findOne({
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: { $gt: now },
    }).select('_id isEmailVerified email');

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
 * @param {{ email: string; userName?: string; rawToken: string }} params
 */
export const deliverEmailVerification = async ({ email, userName, rawToken }) => {
    const frontendUrl = (
        process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173'
    ).replace(/\/$/, '');
    const verifyUrl = `${frontendUrl}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;

    if (isSmtpConfigured()) {
        try {
            const greeting = userName ? `Здравствуйте, ${userName}!` : 'Здравствуйте!';
            const text = `${greeting}\n\nПодтвердите email по ссылке:\n${verifyUrl}\n\nСсылка действует ограниченное время.`;
            await sendSmtpMail({
                to: email,
                subject: EMAIL_VERIFICATION_SUBJECT,
                text,
                html: `<p>${greeting}</p><p><a href="${verifyUrl}">Подтвердить email</a></p><p>Или скопируйте ссылку:</p><p>${verifyUrl}</p>`,
            });
            console.info(`[email-verify] Письмо отправлено на ${email}`);
            return;
        } catch (error) {
            console.error('[email-verify] SMTP send error:', error);
            console.info(`[email-verify] Fallback URL для ${email}:`, verifyUrl);
            return;
        }
    }

    console.info(
        `[email-verify] Подтверждение для ${email}${userName ? ` (${userName})` : ''}:`,
        verifyUrl,
    );
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export const sendEmailVerificationForUser = async (userId) => {
    const user = await UserModel.findById(userId)
        .select('email userName isEmailVerified')
        .lean();

    if (!user?.email) {
        throw new Error('У пользователя нет email');
    }
    if (user.isEmailVerified === true) {
        throw new Error('Email уже подтверждён');
    }

    const rawToken = await issueEmailVerificationToken(userId);
    await deliverEmailVerification({
        email: user.email,
        userName: user.userName,
        rawToken,
    });

    return { email: user.email };
};
