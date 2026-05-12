import { body } from 'express-validator';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';
import {
  assertUserNameFormat,
  normalizeUserNameInput,
} from './userNameRules.js';
import { assertAtMostWords } from '../../utils/maxWordsText.js';

const USER_GENDER_VALUES = ['male', 'female', 'noSelected'];

export const registerUserValidation = [
  body('email').isEmail().withMessage('Неверный email'),

  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),

  body('userName')
    .optional({ values: 'falsy' })
    .trim()
    .customSanitizer((value) => normalizeUserNameInput(value))
    .custom((value) => {
      if (value === undefined || value === '') return true;
      try {
        assertUserNameFormat(value);
      } catch (e) {
        throw new Error(e instanceof Error ? e.message : 'Неверный никнейм');
      }
      return true;
    }),

  body('phoneNumber')
    .optional({ values: 'falsy' })
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Неверный номер телефона'),

  body('avatarUrl').optional({ values: 'falsy' }).isURL().withMessage('URL аватара должен быть валидным URL'),

  body('backgroundUrl')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('URL фона должен быть валидным URL'),

  body('userBirthDate')
    .optional({ values: 'falsy' })
    .isISO8601({ strict: false })
    .withMessage('Неверная дата рождения'),

  body('userGender')
    .optional({ values: 'falsy' })
    .isIn(USER_GENDER_VALUES)
    .withMessage('Неверное значение пола'),

  body('userAddress')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Адрес слишком длинный')
    .custom((value) => {
      if (value === undefined || value === '') return true;
      try {
        assertAtMostWords(value, 'Адрес');
      } catch (e) {
        throw new Error(e instanceof Error ? e.message : 'Слишком длинный адрес');
      }
      return true;
    }),

  body('notificationsEnabled').optional().isBoolean().withMessage('notificationsEnabled должен быть boolean'),

  handleValidationByExpressErrors,
];
