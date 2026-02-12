import { errorRes } from '../utils/index.js';
import mongoose from 'mongoose';

/**
 * Кастомный класс ошибок приложения
 */
export class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Централизованный обработчик ошибок
 * Обрабатывает все ошибки приложения в едином формате
 */
export const errorHandler = (err, req, res, next) => {
    // Если ответ уже отправлен, передаем ошибку в Express
    if (res.headersSent) {
        return next(err);
    }

    // Логируем ошибку для отладки
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Обработка кастомных ошибок AppError
    if (err instanceof AppError) {
        return errorRes(res, err.statusCode, err.message);
    }

    // Обработка ошибок валидации Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message).join(', ');
        return errorRes(res, 400, `Ошибка валидации: ${errors}`);
    }

    // Обработка ошибок приведения типа (CastError)
    if (err.name === 'CastError') {
        return errorRes(res, 400, `Неверный формат данных: ${err.message}`);
    }

    // Обработка ошибок дубликата уникального ключа MongoDB
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'поле';
        return errorRes(res, 409, `Пользователь с таким ${field} уже существует`);
    }

    // Обработка ошибок JWT
    if (err.name === 'JsonWebTokenError') {
        return errorRes(res, 401, 'Невалидный токен');
    }

    if (err.name === 'TokenExpiredError') {
        return errorRes(res, 401, 'Токен истек');
    }

    // Обработка ошибок Multer (загрузка файлов)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return errorRes(res, 413, 'Файл слишком большой. Максимум 5 MB.');
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return errorRes(res, 400, 'Слишком много файлов');
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return errorRes(res, 400, 'Неожиданное поле файла');
    }

    // Обработка ошибок подключения к MongoDB
    if (err instanceof mongoose.Error) {
        return errorRes(res, 500, 'Ошибка базы данных');
    }

    // Обработка ошибок express-validator
    if (err.type === 'validation') {
        return errorRes(res, 400, err.message || 'Ошибка валидации');
    }

    // Обработка ошибок rate limiting
    if (err.statusCode === 429) {
        return errorRes(res, 429, err.message || 'Слишком много запросов');
    }

    // Общая ошибка сервера (500) для непредвиденных ошибок
    return errorRes(res, 500, process.env.NODE_ENV === 'production' 
        ? 'Внутренняя ошибка сервера' 
        : err.message || 'Ошибка сервера'
    );
};

/**
 * Middleware для обработки несуществующих маршрутов (404)
 */
export const notFoundHandler = (req, res, next) => {
    return errorRes(res, 404, `Маршрут ${req.method} ${req.url} не найден`);
};

/**
 * Async handler wrapper для автоматической обработки ошибок в async функциях
 * Использование: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
