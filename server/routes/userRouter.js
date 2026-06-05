import { Router } from "express";
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
  getUserStoriesFeedController,
  getUserStoriesByAuthorController,
  createUserStoryController,
  deleteUserStoryController,
  markUserStoryViewedController,
  submitUserStoryReportController,
  getPendingUserStoryReportsController,
  getPendingUserStoryReportsCountController,
  resolveUserStoryReportsController,
  getMyPremiumStatusController,
  purchasePremiumController,
  getMyLoyaltyPointsStatusController,
} from "../controllers/index.js";
import {
  checkAuthMW,
  checkOptionalAuthMW,
  checkProductModeratorMW,
  updateProfileRateLimiter,
  userDataConfirmationRateLimiter,
  userStoryCreateRateLimiter,
  userStoryReportRateLimiter,
} from "../middlewares/index.js";
import {
  userIdParamValidation,
  updateProfileValidation,
  userSearchValidation,
  userSellerProductsValidationZod,
  submitDataConfirmationValidation,
  resolveDataConfirmationValidation,
  userFollowListValidation,
  userStoryIdParamValidation,
  createUserStoryValidation,
  submitUserStoryReportValidation,
  resolveUserStoryReportsValidation,
} from "../validations/index.js";

const router = Router();

router.get("/search", userSearchValidation, userSearchController);

router.get("/stories/feed", checkOptionalAuthMW, getUserStoriesFeedController);
router.get(
  "/stories/reports/pending",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingUserStoryReportsController,
);
router.get(
  "/stories/reports/pending/count",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingUserStoryReportsCountController,
);
router.patch(
  "/stories/reports/story/:storyId/resolve",
  checkAuthMW,
  checkProductModeratorMW,
  userStoryIdParamValidation,
  resolveUserStoryReportsValidation,
  resolveUserStoryReportsController,
);
router.post(
  "/stories",
  checkAuthMW,
  userStoryCreateRateLimiter,
  createUserStoryValidation,
  createUserStoryController,
);
router.get(
  "/stories/author/:userIdClient",
  checkOptionalAuthMW,
  userIdParamValidation,
  getUserStoriesByAuthorController,
);
router.delete(
  "/stories/:storyId",
  checkAuthMW,
  userStoryIdParamValidation,
  deleteUserStoryController,
);
router.post(
  "/stories/:storyId/view",
  checkAuthMW,
  userStoryIdParamValidation,
  markUserStoryViewedController,
);
router.post(
  "/stories/:storyId/report",
  checkAuthMW,
  userStoryReportRateLimiter,
  userStoryIdParamValidation,
  submitUserStoryReportValidation,
  submitUserStoryReportController,
);

router.get(
  "/me/following",
  checkAuthMW,
  userFollowListValidation,
  listMyFollowingController,
);
router.get(
  "/me/followers",
  checkAuthMW,
  userFollowListValidation,
  listMyFollowersController,
);

router.get(
  "/data-confirmation-requests/pending",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingDataConfirmationRequestsController,
);
router.get(
  "/data-confirmation-requests/pending/count",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingDataConfirmationRequestsCountController,
);
router.patch(
  "/data-confirmation-requests/:requestId/resolve",
  checkAuthMW,
  checkProductModeratorMW,
  resolveDataConfirmationValidation,
  resolveDataConfirmationRequestController,
);

router.get(
  "/me/data-confirmation-request",
  checkAuthMW,
  getMyDataConfirmationRequestController,
);
router.post(
  "/me/data-confirmation-request",
  checkAuthMW,
  userDataConfirmationRateLimiter,
  submitDataConfirmationValidation,
  submitDataConfirmationRequestController,
);

router.get("/me/premium/status", checkAuthMW, getMyPremiumStatusController);
router.post("/me/premium/purchase", checkAuthMW, purchasePremiumController);

router.get(
  "/me/loyalty-points/status",
  checkAuthMW,
  getMyLoyaltyPointsStatusController,
);

router.get(
  "/:userIdClient/purchases",
  checkAuthMW,
  userIdParamValidation,
  getUserPurchasesController,
);
router.get(
  "/:userIdClient/products",
  checkAuthMW,
  userIdParamValidation,
  userSellerProductsValidationZod,
  getUserProductsController,
);
router.post(
  "/:userIdClient/follow",
  checkAuthMW,
  updateProfileRateLimiter,
  userIdParamValidation,
  followUserController,
);
router.delete(
  "/:userIdClient/follow",
  checkAuthMW,
  updateProfileRateLimiter,
  userIdParamValidation,
  unfollowUserController,
);

router.get("/:userIdClient", userIdParamValidation, userGetProfileController);

router.patch(
  "/:userIdClient",
  updateProfileRateLimiter,
  checkAuthMW,
  userIdParamValidation,
  updateProfileValidation,
  userUpdateProfileController,
);

router.delete(
  "/:userIdClient",
  checkAuthMW,
  userIdParamValidation,
  userDeleteProfileController,
);

export { router as userRouter };
