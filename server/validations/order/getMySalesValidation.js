import { query } from 'express-validator';

import { ORDER_STATUSES } from '../../constants/orderConstants.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

const SEARCH_MAX_LENGTH = 100;

/** Валидация query `GET /order/sales` (продажи текущего продавца). */
export const getMySalesValidation = [
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
    query('status')
        .optional()
        .isIn(ORDER_STATUSES)
        .withMessage(`status должен быть одним из: ${ORDER_STATUSES.join(', ')}`),
    query('search')
        .optional()
        .isString()
        .withMessage('search должен быть строкой')
        .trim()
        .isLength({ max: SEARCH_MAX_LENGTH })
        .withMessage(`search не более ${SEARCH_MAX_LENGTH} символов`),
    handleValidationByExpressErrors,
];
