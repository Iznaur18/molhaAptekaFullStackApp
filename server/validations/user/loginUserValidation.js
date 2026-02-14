import { body } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const loginUserValidation = [ // массив валидаций для входа пользователя
    body('email').isEmail().withMessage('Неверный email'), // валидация email
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
    handleValidationByExpressErrors // обработка ошибок валидации
];