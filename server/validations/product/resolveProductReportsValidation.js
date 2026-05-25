import { body } from 'express-validator';

import { PRODUCT_REPORT_RESOLUTIONS } from '../../constants/productReportConstants.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const resolveProductReportsValidation = [
    body('resolution')
        .isString()
        .withMessage('resolution должен быть строкой')
        .isIn(PRODUCT_REPORT_RESOLUTIONS)
        .withMessage('Недопустимое действие'),
    body('staffNote')
        .isString()
        .withMessage('staffNote должен быть строкой')
        .trim()
        .notEmpty()
        .withMessage('Комментарий обязателен')
        .isLength({ max: 2000 })
        .withMessage('Комментарий не длиннее 2000 символов'),
    handleValidationByExpressErrors,
];
