import { Router } from 'express';
import {
    postProductController,
    getProductsController,
    getMyProductsController,
    deleteMyProductController,
} from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';
import {
    makeProductValidation,
    productIdParamValidation,
    productsSearchValidation,
} from '../validations/index.js';

const router = Router();

router.post('/', checkAuthMW, makeProductValidation, postProductController);
router.get('/', productsSearchValidation, getProductsController);
router.get('/my', checkAuthMW, productsSearchValidation, getMyProductsController);
router.delete(
    '/:productId',
    checkAuthMW,
    productIdParamValidation,
    deleteMyProductController,
);

export { router as productRouter };
