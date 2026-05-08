import { body } from 'express-validator';

import {
    ORDER_LINE_ITEM_QUANTITY_MIN,
    ORDER_PAYMENT_METHODS,
} from '../../constants/orderConstants.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

const DELIVERY_ADDRESS_MAX_LENGTH = 300;
const ITEMS_MAX_LENGTH = 100;

/** Валидация тела `POST /order`. totalAmount/status/unitPriceAtOrder ставятся на сервере. */
export const makeOrderValidation = [
    body('items')
        .isArray({ min: 1, max: ITEMS_MAX_LENGTH })
        .withMessage(`items должен быть массивом от 1 до ${ITEMS_MAX_LENGTH} позиций`),
    body('items.*.productId')
        .isMongoId()
        .withMessage('items[].productId должен быть валидным ObjectId'),
    body('items.*.quantity')
        .isInt({ min: ORDER_LINE_ITEM_QUANTITY_MIN })
        .withMessage(`items[].quantity должен быть целым числом >= ${ORDER_LINE_ITEM_QUANTITY_MIN}`)
        .toInt(),
    body('deliveryAddress')
        .isString()
        .withMessage('deliveryAddress должен быть строкой')
        .trim()
        .notEmpty()
        .withMessage('deliveryAddress обязателен')
        .isLength({ max: DELIVERY_ADDRESS_MAX_LENGTH })
        .withMessage(`deliveryAddress не более ${DELIVERY_ADDRESS_MAX_LENGTH} символов`),
    body('paymentMethod')
        .isIn(ORDER_PAYMENT_METHODS)
        .withMessage(`paymentMethod должен быть одним из: ${ORDER_PAYMENT_METHODS.join(', ')}`),
    handleValidationByExpressErrors,
];
