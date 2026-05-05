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
        .exists({ checkNull: true })
        .withMessage('Значение голоса обязательно')
        .bail()
        .custom((value) => {
            const n =
                typeof value === 'number'
                    ? Math.round(value)
                    : parseInt(String(value).trim(), 10);
            if (!Number.isInteger(n) || n < 1 || n > 10) {
                throw new Error('Оценка должна быть целым числом от 1 до 10');
            }
            return true;
        }),

    handleValidationByExpressErrors
];
