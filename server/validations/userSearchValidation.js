import { query } from 'express-validator'; // query — это объект с теми параметрами, которые пришли в URL после ?
import { handleValidationByExpressErrors } from './handleValidationByExpressErrors.js'; // handleValidationByExpressErrors — это функция, которая обрабатывает ошибки валидации и отправляет их клиенту

/**
 * Валидация query-параметров для GET /user/search
 */
export const userSearchValidation = [
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
    query('isPremiumUser')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('isPremiumUser должен быть true или false'),
    query('isActiveUser')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('isActiveUser должен быть true или false'),
    query('isBlockedUser')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('isBlockedUser должен быть true или false'),
    handleValidationByExpressErrors
];
