import { query } from 'express-validator';

import { PRODUCT_SORT_VALUES } from '../../constants/productCatalogSort.js';
import { PRODUCT_CATEGORY_VALUES } from '../../constants/productConstants.js';
import { MY_PRODUCTS_MODERATION_FILTER_VALUES } from '../../constants/productModerationConstants.js';
import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';

/**
 * Валидация query-параметров для GET /product и GET /product/my (поиск по `productName`).
 */
export const productsSearchValidation = [
    query('search')
        .optional()
        .isString()
        .withMessage('search должен быть строкой')
        .isLength({ max: 50 })
        .withMessage('search не более 50 символов')
        .trim(),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page должен быть целым числом от 1')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit должен быть целым числом от 1 до 100')
        .toInt(),
    query('productCategory')
        .optional()
        .isString()
        .withMessage('productCategory должен быть строкой')
        .trim()
        .isIn(PRODUCT_CATEGORY_VALUES)
        .withMessage('Указана неизвестная категория'),
    query('sort')
        .optional()
        .isIn(PRODUCT_SORT_VALUES)
        .withMessage(
            'sort должен быть newest, views, purchases, premium или confirmed',
        ),
    query('includeHidden')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('includeHidden должен быть true или false'),
    query('followingOnly')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('followingOnly должен быть true или false'),
    query('auctionOnly')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('auctionOnly должен быть true или false'),
    query('moderationStatus')
        .optional()
        .isString()
        .withMessage('moderationStatus должен быть строкой')
        .trim()
        .isIn(MY_PRODUCTS_MODERATION_FILTER_VALUES)
        .withMessage('moderationStatus должен быть pending или rejected'),
    handleValidationByExpressErrors,
];
