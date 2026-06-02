import { Router } from 'express';

import {
    getIncomingPriceOffersController,
    getIncomingPriceOffersPendingCountController,
    getMyPriceOfferBidsController,
} from '../controllers/index.js';
import { checkAuthMW } from '../middlewares/index.js';

const router = Router();

router.get('/my-bids', checkAuthMW, getMyPriceOfferBidsController);
router.get('/incoming', checkAuthMW, getIncomingPriceOffersController);
router.get(
    '/incoming/pending-count',
    checkAuthMW,
    getIncomingPriceOffersPendingCountController,
);

export { router as priceOfferRouter };
