import { query } from 'express-validator';

import { ORDER_STATUSES } from '../../constants/orderConstants.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

/** Валидация query `GET /order/all` (только админ). */
export const getAllOrdersValidation = [
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
    handleValidationByExpressErrors,
];
