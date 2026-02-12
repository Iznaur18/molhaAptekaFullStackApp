import rateLimit from 'express-rate-limit';

/**
 * Общий rate limiter для всех API запросов
 * Ограничивает количество запросов с одного IP адреса
 */
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов за 15 минут
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
    max: 5, // максимум 5 попыток входа/регистрации за 15 минут
    message: {
        success: false,
        message: 'Слишком много попыток входа. Попробуйте через 15 минут'
    },
    skipSuccessfulRequests: true, // Не учитывать успешные запросы
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter для операций обновления профиля
 * Защита от массовых изменений
 */
export const updateProfileRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 20, // максимум 20 обновлений профиля в час
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
    max: 10, // максимум 10 голосов в час
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
    max: 10, // максимум 10 загрузок в час
    message: {
        success: false,
        message: 'Слишком много загрузок файлов. Попробуйте позже'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
