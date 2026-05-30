import { body } from 'express-validator';

import { PRODUCT_REPORT_TEXT_MAX_CHARS } from '../../constants/productReportConstants.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const submitProductReportValidation = [
    body('reportText')
        .isString()
        .withMessage('reportText должен быть строкой')
        .trim()
        .notEmpty()
        .withMessage('Укажите текст жалобы')
        .isLength({ max: PRODUCT_REPORT_TEXT_MAX_CHARS })
        .withMessage(
            `Текст жалобы: не больше ${PRODUCT_REPORT_TEXT_MAX_CHARS} символов`,
        ),
    handleValidationByExpressErrors,
];
