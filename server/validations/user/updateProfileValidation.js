import { body, param } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

/**
 * Валидация параметра userId в URL
 */
export const userIdParamValidation = [
    param('userIdClient') // сюда попадает id пользователя из URL из req.params
        .notEmpty() // не пустой
        .withMessage('ID пользователя обязателен') // ошибка если id пользователя не передан
        .isMongoId() // валидный ObjectId
        .withMessage('Неверный формат ID пользователя'), // ошибка если id пользователя не валидный ObjectId
    handleValidationByExpressErrors // обработка ошибок валидации
];

/**
 * Валидация обновления профиля пользователя
 */
export const updateProfileValidation = [
    body('userName') // body значит из запроса req.body. Берем поле userName из тела запроса согласно МОДЕЛИ UserModel
        .optional({ nullable: true, checkFalsy: true }) // опциональное поле, nullable: true - разрешает null, checkFalsy: true - разрешает false
        .trim() // обрезаем пробелы перед валидацией
        .custom((value) => {
            if (value === null || value === '') { // если значение null или пустое, то разрешаем
                return true; // Разрешаем null для очистки
            }
            if (typeof value !== 'string' || value.length < 3) { // если значение не строка или длина строки меньше 3 символов, то ошибка
                throw new Error('Имя пользователя должно быть строкой не менее 3 символов');
            }
            return true; // возвращаем true
        }),
    
    body('userBirthDate')
        .optional({ nullable: true, checkFalsy: true }) // опциональное поле, nullable: true - разрешает null, checkFalsy: true - разрешает false
        .custom((value) => {
            if (value === null || value === '') { // если значение null или пустое, то разрешаем
                return true; // Разрешаем null для очистки
            }
            const date = new Date(value); 
            if (isNaN(date.getTime())) { // если значение не является валидной датой, то ошибка
                throw new Error('Дата рождения должна быть в формате ISO 8601'); 
            }
            if (date > new Date()) { // если дата в будущем, то ошибка
                throw new Error('Дата рождения не может быть в будущем');
            }
            return true;
        }),
    
    body('userGender')
        .optional({ nullable: true }) // опциональное поле, nullable: true - разрешает null
        .isIn(['male', 'female', 'noSelected'])
        .withMessage('Пол должен быть одним из: male, female, noSelected'),
    
    body('userAddress')
        .optional({ nullable: true }) // опциональное поле, nullable: true - разрешает null
        .trim() // обрезаем пробелы перед валидацией
        .custom((value) => {
            if (value === null || value === '') { // если значение null или пустое, то разрешаем
                return true; // Разрешаем null
            }
            if (typeof value !== 'string') { // если значение не строка, то ошибка
                throw new Error('Адрес должен быть строкой');
            }
            return true; // возвращаем true
        }),
    
    body('userPhoneNumber')
        .optional({ nullable: true, checkFalsy: true }) // опциональное поле, nullable: true - разрешает null, checkFalsy: true - разрешает false
        .trim() // обрезаем пробелы перед валидацией
        .custom((value) => {
            if (value === null || value === '') { // если значение null или пустое, то разрешаем
                return true; // Разрешаем null для очистки
            }
            // Базовая проверка формата телефона (более строгая проверка в контроллере не нужна, так как это опциональное поле)
            if (typeof value !== 'string') { // если значение не строка, то ошибка
                throw new Error('Номер телефона должен быть строкой');
            }
            return true; // возвращаем true
        }),
    
    body('userAvatarUrl')
        .optional({ nullable: true, checkFalsy: true }) // опциональное поле, nullable: true - разрешает null, checkFalsy: true - разрешает false
        .custom((value) => {
            if (value === null || value === '') { // если значение null или пустое, то разрешаем
                return true; // Разрешаем null для очистки
            }
            try {
                new URL(value); // пытаемся создать URL из значения 
                return true;
            } catch {
                throw new Error('URL аватара должен быть валидным URL');
            }
        }),
    
    body('userBackgroundUrl') // userBackgroundUrl - URL фона пользователя
        .optional({ nullable: true, checkFalsy: true }) // опциональное поле, nullable: true - разрешает null, checkFalsy: true - разрешает false
        .custom((value) => {
            if (value === null || value === '') { // если значение null или пустое, то разрешаем
                return true; // Разрешаем null для очистки
            }
            try {
                new URL(value);
                return true;
            } catch {
                throw new Error('URL фона должен быть валидным URL');
            }
        }),
    
    body('notificationsEnabled') // notificationsEnabled - уведомления пользователя
        .optional({ nullable: true }) // опциональное поле, nullable: true - разрешает null
        .isBoolean()
        .withMessage('notificationsEnabled должен быть булевым значением'), // ошибка если notificationsEnabled не является булевым значением
    
    body('userRole')
        .optional({ nullable: true })
        .isIn(['user', 'admin', 'pharmacist'])
        .withMessage('Роль должна быть одной из: user, admin, pharmacist'),
    
    body('isActiveUser')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage('isActiveUser должен быть булевым значением'),
    
    body('isBlockedUser')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage('isBlockedUser должен быть булевым значением'),
    
    body('userDiscountPercent')
        .optional({ nullable: true })
        .isFloat({ min: 0, max: 100 })
        .withMessage('Процент скидки должен быть числом от 0 до 100'),
    
    body('isPremiumUser')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage('isPremiumUser должен быть булевым значением'),
    
    body('notesAboutUser')
        .optional({ nullable: true })
        .trim() // обрезаем пробелы перед валидацией
        .custom((value) => {
            if (value === null || value === '') {
                return true; // Разрешаем null
            }
            if (typeof value !== 'string') {
                throw new Error('Заметки должны быть строкой');
            }
            return true;
        }),
    
    handleValidationByExpressErrors
];
