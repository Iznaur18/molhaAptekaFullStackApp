import rateLimit from 'express-rate-limit';

import { PRODUCT_REPORT_RATE_LIMIT_PER_HOUR } from '../constants/productReportConstants.js';
import { USER_STORY_RATE_LIMIT_PER_HOUR } from '../constants/userStoryConstants.js';
import { USER_DATA_CONFIRMATION_RATE_LIMIT_PER_HOUR } from '../constants/userDataConfirmationConstants.js';
import { EMAIL_VERIFICATION_RESEND_RATE_LIMIT_PER_HOUR } from '../constants/emailVerificationConstants.js';
import { PRICE_OFFER_RATE_LIMIT_PER_HOUR } from '../constants/productPriceOfferConstants.js';
import { PRODUCT_REVIEW_RATE_LIMIT_PER_HOUR } from '../constants/productReviewConstants.js';

/**
 * Общий rate limiter для всех API запросов
 * Ограничивает количество запросов с одного IP адреса
 */
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 10_000, // максимум 10 000 запросов за 15 минут
    message: {
        success: false,
        message: 'Слишком много запросов с этого IP, попробуйте позже'
    },
    standardHeaders: true, // Возвращает информацию о лимитах в заголовках `RateLimit-*`
    legacyHeaders: false, // Отключает заголовки `X-RateLimit-*`
});

/**
 * Строгий rate limiter для авторизации и регистрации
 * Защита от брутфорса и массовой регистрации
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 55, // максимум 55 попыток входа/регистрации за 15 минут
    message: {
        success: false,
        message: 'Слишком много попыток входа. Попробуйте через 15 минут'
    },
    skipSuccessfulRequests: true, // Не учитывать успешные запросы
    standardHeaders: true,
    legacyHeaders: false,
});

/** Защита POST /auth/refresh от перебора refresh cookie. */
export const refreshAuthRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    message: {
        success: false,
        message: 'Слишком много запросов обновления сессии. Попробуйте позже',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter для операций обновления профиля
 * Защита от массовых изменений
 */
export const updateProfileRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 120, // максимум 20 обновлений профиля в час
    message: {
        success: false,
        message: 'Слишком много обновлений профиля. Попробуйте позже'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter для голосований
 * Защита от накрутки рейтинга
 */
export const voteRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 110, // максимум 10 голосов в час
    message: {
        success: false,
        message: 'Слишком много голосований. Попробуйте позже'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter для загрузки файлов
 * Защита от перегрузки сервера
 */
export const uploadRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 110, // максимум 10 загрузок в час
    message: {
        success: false,
        message: 'Слишком много загрузок файлов. Попробуйте позже'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/** Лимит на полную замену корзины (частые debounce-сейвы с клиента). */
export const cartReplaceRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    message: {
        success: false,
        message: 'Слишком много обновлений корзины. Попробуйте позже',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/** Лимит жалоб на товары с одного аккаунта. */
export const productReportRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: PRODUCT_REPORT_RATE_LIMIT_PER_HOUR,
    message: {
        success: false,
        message: 'Слишком много жалоб. Попробуйте позже',
    },
    keyGenerator: (req) => String(req.userId ?? req.ip ?? 'unknown'),
    standardHeaders: true,
    legacyHeaders: false,
});

/** Лимит жалоб на сторис с одного аккаунта. */
export const userStoryReportRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: USER_STORY_RATE_LIMIT_PER_HOUR,
    message: {
        success: false,
        message: 'Слишком много жалоб. Попробуйте позже',
    },
    keyGenerator: (req) => String(req.userId ?? req.ip ?? 'unknown'),
    standardHeaders: true,
    legacyHeaders: false,
});

/** Лимит публикаций сторис с одного аккаунта. */
export const userStoryCreateRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Слишком много публикаций сторис. Попробуйте позже',
    },
    keyGenerator: (req) => String(req.userId ?? req.ip ?? 'unknown'),
    standardHeaders: true,
    legacyHeaders: false,
});

/** Лимит заявок на подтверждение данных. */
export const productPriceOfferRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: PRICE_OFFER_RATE_LIMIT_PER_HOUR,
    message: {
        success: false,
        message: 'Слишком много предложений цены. Попробуйте позже',
    },
    keyGenerator: (req) => String(req.userId ?? req.ip ?? 'unknown'),
    standardHeaders: true,
    legacyHeaders: false,
});

export const userDataConfirmationRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: USER_DATA_CONFIRMATION_RATE_LIMIT_PER_HOUR,
    message: {
        success: false,
        message: 'Слишком много заявок. Попробуйте позже',
    },
    keyGenerator: (req) => String(req.userId ?? req.ip ?? 'unknown'),
    standardHeaders: true,
    legacyHeaders: false,
});

export const emailVerificationResendRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: EMAIL_VERIFICATION_RESEND_RATE_LIMIT_PER_HOUR,
    message: {
        success: false,
        message: 'Слишком много запросов на отправку письма. Попробуйте позже',
    },
    keyGenerator: (req) => String(req.userId ?? req.ip ?? 'unknown'),
    standardHeaders: true,
    legacyHeaders: false,
});

/** Лимит отзывов на товары с одного аккаунта. */
export const productReviewRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: PRODUCT_REVIEW_RATE_LIMIT_PER_HOUR,
    message: {
        success: false,
        message: 'Слишком много отзывов. Попробуйте позже',
    },
    keyGenerator: (req) => String(req.userId ?? req.ip ?? 'unknown'),
    standardHeaders: true,
    legacyHeaders: false,
});
