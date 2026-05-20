import { Router } from 'express';
import {
    postProductController,
    getProductsController,
    getMyProductsController,
    deleteMyProductController,
    patchMyProductController,
    recordProductViewController,
    getPendingModerationProductsController,
    approveProductModerationController,
    rejectProductModerationController,
} from '../controllers/index.js';
import {
    checkAuthMW,
    checkOptionalAuthMW,
    checkProductModeratorMW,
} from '../middlewares/index.js';
import {
    makeProductValidation,
    productIdParamValidation,
    productsSearchValidation,
    patchMyProductValidation,
    rejectProductModerationValidation,
} from '../validations/index.js';

const router = Router();

router.post('/', checkAuthMW, makeProductValidation, postProductController);
router.get('/', productsSearchValidation, checkOptionalAuthMW, getProductsController);
router.get('/my', checkAuthMW, productsSearchValidation, getMyProductsController);
router.get(
    '/moderation/pending',
    checkAuthMW,
    checkProductModeratorMW,
    productsSearchValidation,
    getPendingModerationProductsController,
);
router.post(
    '/:productId/view',
    checkAuthMW,
    productIdParamValidation,
    recordProductViewController,
);
router.patch(
    '/:productId/moderation/approve',
    checkAuthMW,
    checkProductModeratorMW,
    productIdParamValidation,
    approveProductModerationController,
);
router.patch(
    '/:productId/moderation/reject',
    checkAuthMW,
    checkProductModeratorMW,
    productIdParamValidation,
    rejectProductModerationValidation,
    rejectProductModerationController,
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
