import { body, param } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';
import {
  assertRuPhoneFormat,
  normalizeRuPhoneInput,
} from './ruPhoneRules.js';
import {
  assertUserNameFormat,
  normalizeUserNameInput,
} from './userNameRules.js';
import {
    assertAtMostChars,
} from '../../utils/maxWordsText.js';
import { ruDeliveryAddressBodyValidation } from '../address/ruDeliveryAddressValidation.js';
import { parseUserBackgroundPresetId } from '../../constants/userBackgroundPresets.js';
import { isHttpBackgroundImageUrl } from '../../utils/userBackgroundValue.js';
import { assertProfileImageFocus } from '../../utils/profileImageFocus.js';

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
    body('userName')
        .optional({ nullable: true, checkFalsy: true })
        .customSanitizer((value) => {
            if (value === null || value === undefined) return value;
            if (typeof value === 'string' && value.trim() === '') return null;
            return normalizeUserNameInput(value);
        })
        .custom((value) => {
            if (value === null || value === '') {
                return true;
            }
            try {
                assertUserNameFormat(value);
            } catch (e) {
                throw new Error(e instanceof Error ? e.message : 'Неверный никнейм');
            }
            return true;
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
    
    ...ruDeliveryAddressBodyValidation(),
    
    body('userPhoneNumber')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .customSanitizer((value) => {
            if (value === null || value === undefined) return value;
            if (typeof value === 'string' && value.trim() === '') return null;
            return normalizeRuPhoneInput(value);
        })
        .custom((value) => {
            if (value === null || value === '') {
                return true;
            }
            try {
                assertRuPhoneFormat(value);
            } catch (e) {
                throw new Error(e instanceof Error ? e.message : 'Неверный номер телефона');
            }
            return true;
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

    body('userAvatarFocus')
        .optional({ nullable: true })
        .custom((value) => {
            assertProfileImageFocus(value, 'Фокус аватара');
            return true;
        }),

    body('userBackgroundFocus')
        .optional({ nullable: true })
        .custom((value) => {
            assertProfileImageFocus(value, 'Фокус фона');
            return true;
        }),
    
    body('userBackgroundUrl')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (value === null || value === '') {
                return true;
            }
            if (parseUserBackgroundPresetId(value)) {
                return true;
            }
            if (isHttpBackgroundImageUrl(value)) {
                return true;
            }
            throw new Error(
                'Фон: пресет preset:<id> или URL (http/https)',
            );
        }),
    
    body('notificationsEnabled') // notificationsEnabled - уведомления пользователя
        .optional({ nullable: true }) // опциональное поле, nullable: true - разрешает null
        .isBoolean()
        .withMessage('notificationsEnabled должен быть булевым значением'), // ошибка если notificationsEnabled не является булевым значением
    
    body('userRole')
        .optional({ nullable: true })
        .isIn(['user', 'admin', 'moderator'])
        .withMessage('Роль должна быть одной из: user, admin, moderator'),
    
    body('isActiveUser')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage('isActiveUser должен быть булевым значением'),

    body('isUserDataConfirmed')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage('isUserDataConfirmed должен быть булевым значением'),
    
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
            try {
                assertAtMostChars(value, 'Заметки о пользователе');
            } catch (e) {
                throw new Error(e instanceof Error ? e.message : 'Слишком длинный текст');
            }
            return true;
        }),
    
    handleValidationByExpressErrors
];
