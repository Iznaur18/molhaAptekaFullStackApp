import { body, param, query } from 'express-validator';
import {
    PRODUCT_PROMOTION_PAYMENT_METHODS,
    PRODUCT_PROMOTION_STATUS_ACTIVE,
    PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
    PRODUCT_PROMOTION_STATUS_EXPIRED,
    PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
    PRODUCT_PROMOTION_STATUS_REJECTED,
} from '../../constants/productPromotionConstants.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

const PROMOTION_STATUSES = [
    PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
    PRODUCT_PROMOTION_STATUS_ACTIVE,
    PRODUCT_PROMOTION_STATUS_EXPIRED,
    PRODUCT_PROMOTION_STATUS_REJECTED,
    PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
];

export const requestProductPromotionValidation = [
    body('tariffCode')
        .isString()
        .withMessage('tariffCode обязателен')
        .trim()
        .notEmpty()
        .withMessage('tariffCode обязателен')
        .isLength({ max: 40 })
        .withMessage('Слишком длинный tariffCode'),
    body('paymentMethod')
        .isString()
        .withMessage('paymentMethod обязателен')
        .trim()
        .notEmpty()
        .withMessage('paymentMethod обязателен')
        .custom((value) => PRODUCT_PROMOTION_PAYMENT_METHODS.includes(String(value)))
        .withMessage(
            `paymentMethod должен быть одним из: ${PRODUCT_PROMOTION_PAYMENT_METHODS.join(', ')}`,
        ),
    handleValidationByExpressErrors,
];

export const promotionIdParamValidation = [
    param('promotionId')
        .notEmpty()
        .withMessage('ID продвижения обязателен')
        .isMongoId()
        .withMessage('Неверный формат ID продвижения'),
    handleValidationByExpressErrors,
];

export const myProductPromotionsValidation = [
    query('status')
        .optional()
        .isString()
        .withMessage('status должен быть строкой')
        .custom((value) => PROMOTION_STATUSES.includes(String(value)))
        .withMessage(`status должен быть одним из: ${PROMOTION_STATUSES.join(', ')}`),
    handleValidationByExpressErrors,
];
