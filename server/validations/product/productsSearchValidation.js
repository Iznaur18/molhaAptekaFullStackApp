import { query } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

/**
 * Валидация query-параметров для GET /product и GET /product/my (поиск по `productName`).
 */
export const productsSearchValidation = [
    query('search')
        .optional()
        .isString()
        .withMessage('search должен быть строкой')
        .isLength({ max: 50 })
        .withMessage('search не более 50 символов')
        .trim(),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page должен быть целым числом от 1')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit должен быть целым числом от 1 до 100')
        .toInt(),
    handleValidationByExpressErrors,
];
