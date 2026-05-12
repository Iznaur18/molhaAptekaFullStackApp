import { Router } from 'express';
import {
    postProductController,
    getProductsController,
    getMyProductsController,
    deleteMyProductController,
    patchMyProductAvailabilityController,
} from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';
import {
    makeProductValidation,
    productIdParamValidation,
    productsSearchValidation,
    updateProductAvailabilityValidation,
} from '../validations/index.js';

const router = Router();

router.post('/', checkAuthMW, makeProductValidation, postProductController);
router.get('/', productsSearchValidation, getProductsController);
router.get('/my', checkAuthMW, productsSearchValidation, getMyProductsController);
router.patch(
    '/:productId',
    checkAuthMW,
    productIdParamValidation,
    updateProductAvailabilityValidation,
    patchMyProductAvailabilityController,
);
router.delete(
    '/:productId',
    checkAuthMW,
    productIdParamValidation,
    deleteMyProductController,
);

export { router as productRouter };
