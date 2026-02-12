import { validationResult } from 'express-validator';
import { errorRes } from '../utils/index.js';

/**
 * Middleware для обработки ошибок валидации express-validator
 * Возвращает ошибки в едином формате приложения
 */
export const handleValidationByExpressErrors = (req, res, next) => {
    const errors = validationResult(req); // получаем ошибки валидации
    
    if (!errors.isEmpty()) { // если есть ошибки, возвращаем ошибку
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        return errorRes(res, 400, `Ошибка валидации: ${errorMessages}`);
    }
    
    next(); // продолжаем выполнение следующего middleware
}