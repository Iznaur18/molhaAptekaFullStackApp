import { Router } from 'express';
import {
    postProductController,
    getProductsController,
    getMyProductsController,
    deleteMyProductController,
    patchMyProductController,
    recordProductViewController,
} from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';
import {
    makeProductValidation,
    productIdParamValidation,
    productsSearchValidation,
    patchMyProductValidation,
} from '../validations/index.js';

const router = Router();

router.post('/', checkAuthMW, makeProductValidation, postProductController);
router.get('/', productsSearchValidation, getProductsController);
router.get('/my', checkAuthMW, productsSearchValidation, getMyProductsController);
router.post(
    '/:productId/view',
    checkAuthMW,
    productIdParamValidation,
    recordProductViewController,
);
router.patch(
    '/:productId',
    checkAuthMW,
    productIdParamValidation,
    patchMyProductValidation,
    patchMyProductController,
);
router.delete(
    '/:productId',
    checkAuthMW,
    productIdParamValidation,
    deleteMyProductController,
);

export { router as productRouter };
