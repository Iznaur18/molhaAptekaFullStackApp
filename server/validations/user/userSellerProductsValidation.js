import { query } from 'express-validator';

import { handleValidationByExpressErrors } from '../handleValidationByExpressErrors.js';
import { USER_SELLER_PRODUCTS_PAGE_SIZE_MAX } from '../../utils/userSellerCatalogProducts.js';

export const userSellerProductsValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page должен быть целым числом от 1')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: USER_SELLER_PRODUCTS_PAGE_SIZE_MAX })
        .withMessage(
            `limit должен быть целым числом от 1 до ${USER_SELLER_PRODUCTS_PAGE_SIZE_MAX}`,
        )
        .toInt(),
    handleValidationByExpressErrors,
];
