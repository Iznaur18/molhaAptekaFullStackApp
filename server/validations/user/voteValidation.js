import { body, param } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

/**
 * Валидация параметра userId в URL для голосования
 */
export const voteTargetIdParamValidation = [
    param('userVoteTargetIdClient')
        .notEmpty()
        .withMessage('ID целевого пользователя обязателен')
        .isMongoId()
        .withMessage('Неверный формат ID пользователя'),
    handleValidationByExpressErrors
];

/**
 * Валидация голосования за пользователя
 */
export const voteValidation = [
    body('userVoteValueClient')
        .notEmpty()
        .withMessage('Значение голоса обязательно')
        .isInt({ min: 1, max: 10 })
        .withMessage('Оценка должна быть числом от 1 до 10'),
    
    handleValidationByExpressErrors
];
