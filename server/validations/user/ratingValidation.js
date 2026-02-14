import { param } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

/**
 * Валидация параметра userId в URL для получения рейтинга
 */
export const ratingUserIdParamValidation = [
    param('userIdClient') // userIdClient - id пользователя из URL
        .notEmpty() // не пустой
        .withMessage('ID пользователя обязателен') // ошибка если id пользователя не передан
        .isMongoId() // валидный ObjectId
        .withMessage('Неверный формат ID пользователя'), // ошибка если id пользователя не валидный ObjectId
    handleValidationByExpressErrors // обработка ошибок валидации
];
