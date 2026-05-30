import { body, param, query } from 'express-validator';

import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';
import { assertProfileImageFocus } from '../../utils/profileImageFocus.js';
import { assertRaffleCreatePrizeMedia, normalizePrizeMediaType } from '../../utils/rafflePrizeMedia.js';
import {
    RAFFLE_DESCRIPTION_MAX_LENGTH,
    RAFFLE_INSTAGRAM_URL_MAX_LENGTH,
    RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
    RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
    RAFFLE_PRIZE_MEDIA_TYPES,
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
    body('prizeMediaType')
        .optional()
        .isIn(RAFFLE_PRIZE_MEDIA_TYPES)
        .withMessage('Тип медиа приза: image или video'),
    body('prizeImageUrl')
        .optional({ values: 'falsy' })
        .trim()
        .custom((value, { req }) => {
            const type = normalizePrizeMediaType(req.body?.prizeMediaType);
            if (type !== RAFFLE_PRIZE_MEDIA_TYPE_IMAGE) {
                return true;
            }
            const url = String(value ?? '').trim();
            if (!url) {
                throw new Error('Добавьте фото приза');
            }
            if (!isHttpUrl(url)) {
                throw new Error('Укажите корректную ссылку на изображение');
            }
            return true;
        }),
    body('prizeVideoUrl')
        .optional({ values: 'falsy' })
        .trim()
        .custom((value, { req }) => {
            const type = normalizePrizeMediaType(req.body?.prizeMediaType);
            if (type !== RAFFLE_PRIZE_MEDIA_TYPE_VIDEO) {
                return true;
            }
            const url = String(value ?? '').trim();
            if (!url) {
                throw new Error('Добавьте видео приза');
            }
            if (!isHttpUrl(url)) {
                throw new Error('Укажите корректную ссылку на видео');
            }
            return true;
        }),
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
    body().custom((_, { req }) => {
        assertRaffleCreatePrizeMedia(req.body ?? {});
        return true;
    }),
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
    body('prizeMediaType')
        .optional()
        .isIn(RAFFLE_PRIZE_MEDIA_TYPES),
    body('prizeImageUrl')
        .optional({ values: 'falsy' })
        .trim()
        .custom((value) => {
            const url = String(value ?? '').trim();
            if (url === '') {
                return true;
            }
            if (!isHttpUrl(url)) {
                throw new Error('Укажите корректную ссылку на изображение');
            }
            return true;
        }),
    body('prizeVideoUrl')
        .optional({ values: 'falsy' })
        .trim()
        .custom((value) => {
            const url = String(value ?? '').trim();
            if (url === '') {
                return true;
            }
            if (!isHttpUrl(url)) {
                throw new Error('Укажите корректную ссылку на видео');
            }
            return true;
        }),
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
