import { body } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const telegramAuthValidation = [
    body('telegramUserId').notEmpty().withMessage('Укажите telegramUserId'),
    handleValidationByExpressErrors,
];
