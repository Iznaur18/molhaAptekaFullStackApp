import { Router } from 'express';
import {
    userGetProfileController,
    userUpdateProfileController,
    userDeleteProfileController,
    userSearchController,
    getUserPurchasesController,
    getUserProductsController,
    submitDataConfirmationRequestController,
    getMyDataConfirmationRequestController,
    getPendingDataConfirmationRequestsController,
    getPendingDataConfirmationRequestsCountController,
    resolveDataConfirmationRequestController,
    followUserController,
    unfollowUserController,
    listMyFollowingController,
    listMyFollowersController,
} from '../controllers/index.js';
import {
    checkAuthMW,
    checkProductModeratorMW,
    updateProfileRateLimiter,
    userDataConfirmationRateLimiter,
} from '../middlewares/index.js';
import {
    userIdParamValidation,
    updateProfileValidation,
    userSearchValidation,
    userSellerProductsValidation,
    submitDataConfirmationValidation,
    resolveDataConfirmationValidation,
    userFollowListValidation,
} from '../validations/index.js';

const router = Router();

router.get('/search', userSearchValidation, userSearchController);

router.get(
    '/me/following',
    checkAuthMW,
    userFollowListValidation,
    listMyFollowingController,
);
router.get(
    '/me/followers',
    checkAuthMW,
    userFollowListValidation,
    listMyFollowersController,
);

router.get(
    '/data-confirmation-requests/pending',
    checkAuthMW,
    checkProductModeratorMW,
    getPendingDataConfirmationRequestsController,
);
router.get(
    '/data-confirmation-requests/pending/count',
    checkAuthMW,
    checkProductModeratorMW,
    getPendingDataConfirmationRequestsCountController,
);
router.patch(
    '/data-confirmation-requests/:requestId/resolve',
    checkAuthMW,
    checkProductModeratorMW,
    resolveDataConfirmationValidation,
    resolveDataConfirmationRequestController,
);

router.get(
    '/me/data-confirmation-request',
    checkAuthMW,
    getMyDataConfirmationRequestController,
);
router.post(
    '/me/data-confirmation-request',
    checkAuthMW,
    userDataConfirmationRateLimiter,
    submitDataConfirmationValidation,
    submitDataConfirmationRequestController,
);

router.get(
    '/:userIdClient/purchases',
    checkAuthMW,
    userIdParamValidation,
    getUserPurchasesController,
);
router.get(
    '/:userIdClient/products',
    checkAuthMW,
    userIdParamValidation,
    userSellerProductsValidation,
    getUserProductsController,
);
router.post(
    '/:userIdClient/follow',
    checkAuthMW,
    updateProfileRateLimiter,
    userIdParamValidation,
    followUserController,
);
router.delete(
    '/:userIdClient/follow',
    checkAuthMW,
    updateProfileRateLimiter,
    userIdParamValidation,
    unfollowUserController,
);

router.get('/:userIdClient', userIdParamValidation, userGetProfileController);

router.patch(
    '/:userIdClient',
    updateProfileRateLimiter,
    checkAuthMW,
    userIdParamValidation,
    updateProfileValidation,
    userUpdateProfileController,
);

router.delete(
    '/:userIdClient',
    checkAuthMW,
    userIdParamValidation,
    userDeleteProfileController,
);

export { router as userRouter };
