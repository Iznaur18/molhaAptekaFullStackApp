import { body } from 'express-validator';

import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const submitProductReportValidation = [
    body('reportText')
        .isString()
        .withMessage('reportText должен быть строкой')
        .trim()
        .notEmpty()
        .withMessage('Укажите текст жалобы'),
    handleValidationByExpressErrors,
];
