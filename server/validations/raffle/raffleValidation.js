import { body, param, query } from 'express-validator';

import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';
import { assertProfileImageFocus } from '../../utils/profileImageFocus.js';
import {
    RAFFLE_DESCRIPTION_MAX_LENGTH,
    RAFFLE_INSTAGRAM_URL_MAX_LENGTH,
    RAFFLE_TARGET_SALES_MAX,
    RAFFLE_TARGET_SALES_MIN,
    RAFFLE_TITLE_MAX_LENGTH,
} from '../../constants/raffleConstants.js';

const isHttpUrl = (value) => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    return /^https?:\/\/.+/i.test(trimmed);
};

const validationDone = handleValidationByExpressErrors;

export const createRaffleValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Укажите название розыгрыша')
        .isLength({ max: RAFFLE_TITLE_MAX_LENGTH }),
    body('description')
        .optional({ values: 'null' })
        .isString()
        .isLength({ max: RAFFLE_DESCRIPTION_MAX_LENGTH }),
    body('prizeImageUrl')
        .trim()
        .notEmpty()
        .withMessage('Добавьте фото приза')
        .custom(isHttpUrl)
        .withMessage('Укажите корректную ссылку на изображение'),
    body('prizeImageFocus')
        .optional({ nullable: true })
        .custom((value) => {
            assertProfileImageFocus(value, 'Фокус фото приза');
            return true;
        }),
    body('targetSales')
        .isInt({ min: RAFFLE_TARGET_SALES_MIN, max: RAFFLE_TARGET_SALES_MAX })
        .withMessage(`Цель: от ${RAFFLE_TARGET_SALES_MIN} до ${RAFFLE_TARGET_SALES_MAX}`),
    body('instagramUrl')
        .trim()
        .notEmpty()
        .withMessage('Укажите ссылку на Instagram')
        .isLength({ max: RAFFLE_INSTAGRAM_URL_MAX_LENGTH })
        .custom(isHttpUrl)
        .withMessage('Укажите корректную ссылку Instagram'),
    validationDone,
];

export const patchRaffleValidation = [
    param('raffleId').isMongoId().withMessage('Некорректный id розыгрыша'),
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .isLength({ max: RAFFLE_TITLE_MAX_LENGTH }),
    body('description')
        .optional({ values: 'null' })
        .isString()
        .isLength({ max: RAFFLE_DESCRIPTION_MAX_LENGTH }),
    body('prizeImageUrl')
        .optional()
        .trim()
        .notEmpty()
        .custom(isHttpUrl),
    body('prizeImageFocus')
        .optional({ nullable: true })
        .custom((value) => {
            assertProfileImageFocus(value, 'Фокус фото приза');
            return true;
        }),
    body('targetSales')
        .optional()
        .isInt({ min: RAFFLE_TARGET_SALES_MIN, max: RAFFLE_TARGET_SALES_MAX }),
    body('instagramUrl')
        .optional()
        .trim()
        .notEmpty()
        .isLength({ max: RAFFLE_INSTAGRAM_URL_MAX_LENGTH })
        .custom(isHttpUrl),
    validationDone,
];

export const raffleIdParamValidation = [
    param('raffleId').isMongoId().withMessage('Некорректный id розыгрыша'),
    validationDone,
];

export const rejectRaffleValidation = [
    param('raffleId').isMongoId().withMessage('Некорректный id розыгрыша'),
    body('comment')
        .optional({ values: 'null' })
        .isString()
        .isLength({ max: 2000 }),
    validationDone,
];

export const raffleProductsValidation = [
    param('raffleId').isMongoId().withMessage('Некорректный id розыгрыша'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validationDone,
];

export const setProductRaffleParticipationValidation = [
    param('productId').isMongoId().withMessage('Некорректный id товара'),
    body('enabled').isBoolean().withMessage('Укажите enabled: true/false'),
    validationDone,
];
