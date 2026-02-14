import { body } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

export const registerUserValidation = [ // массив валидаций для регистрации пользователя
    body('email')
        .isEmail()
        .withMessage('Неверный email'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен быть не менее 6 символов'),
    
    body('userName')
        .optional() // поле опционально
        .isLength({ min: 3 })
        .withMessage('Ник должен быть не менее 3 символов')
        .trim(),
    
    body('phoneNumber')
        .optional() // поле опционально
        .isMobilePhone('any', { strictMode: false })
        .withMessage('Неверный номер телефона')
        .trim(),
    
    body('avatarUrl')
        .optional() // поле опционально
        .isURL()
        .withMessage('URL аватара должен быть валидным URL'),
    
    handleValidationByExpressErrors // обработка ошибок валидации
];