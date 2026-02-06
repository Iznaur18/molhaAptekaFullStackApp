import { body } from 'express-validator';
import { handleValidationByExpressErrors } from './handleValidationByExpressErrors.js';

export const registerUserValidation = [ // массив валидаций для регистрации пользователя
    body('email').isEmail().withMessage('Неверный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
    body('userName').isLength({ min: 3 }).withMessage('Ник должен быть не менее 3 символов'),
    body('phoneNumber').isMobilePhone().withMessage('Неверный номер телефона'),
    handleValidationByExpressErrors // обработка ошибок валидации
];