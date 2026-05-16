import { body } from 'express-validator';

import { ADDRESS_LINE_MAX_LENGTH } from '../../constants/dadataConstants.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const addressSuggestValidation = [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('query обязателен')
    .isLength({ min: 2, max: ADDRESS_LINE_MAX_LENGTH })
    .withMessage(`query от 2 до ${ADDRESS_LINE_MAX_LENGTH} символов`),
  handleValidationByExpressErrors,
];
