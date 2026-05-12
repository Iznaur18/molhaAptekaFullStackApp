import { Router } from 'express';

import {
    getMyCartController,
    replaceMyCartController,
} from '../controllers/index.js';
import { cartReplaceRateLimiter, checkAuthMW } from '../middlewares/index.js';
import { replaceMyCartValidation } from '../validations/index.js';

const router = Router();

router.get('/', checkAuthMW, getMyCartController);
router.put(
    '/',
    checkAuthMW,
    cartReplaceRateLimiter,
    replaceMyCartValidation,
    replaceMyCartController,
);

export { router as cartRouter };
