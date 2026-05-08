import { param } from 'express-validator';

import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

/** Валидация param для `PATCH /order/:orderId/items/:itemIndex/*`. */
export const orderItemActionValidation = [
    param('orderId')
        .isMongoId()
        .withMessage('orderId должен быть валидным ObjectId'),
    param('itemIndex')
        .isInt({ min: 0 })
        .withMessage('itemIndex должен быть целым числом >= 0')
        .toInt(),
    handleValidationByExpressErrors,
];
