import { body, param } from 'express-validator';

import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const productPriceOfferIdParamValidation = [
    param('offerId').isMongoId().withMessage('Некорректный id предложения'),
    handleValidationByExpressErrors,
];

export const submitProductPriceOfferValidation = [
    body('offerPrice')
        .isInt({ min: 1 })
        .withMessage('offerPrice — целое число больше 0')
        .toInt(),
    handleValidationByExpressErrors,
];

export const patchProductPriceOfferValidation = [
    body('offerPrice')
        .isInt({ min: 1 })
        .withMessage('offerPrice — целое число больше 0')
        .toInt(),
    handleValidationByExpressErrors,
];
