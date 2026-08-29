import { createAsyncRouter } from "../utils/createAsyncRouter.js";
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
  blockUserController,
  unblockUserController,
  listMyBlockedUsersController,
  listUserBlockedUsersModeratorController,
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
  adminCreditOwnLoyaltyPointsController,
  getMyReferralProgramController,
  getMyAffiliateEarningsController,
  getMonthlyLoyaltyPointsAwardedController,
  getUserPhoneController,
} from "../controllers/index.js";
import {
  checkAuthMW,
  checkOptionalAuthMW,
  checkAdminMW,
  checkProductModeratorMW,
  updateProfileRateLimiter,
  userDataConfirmationRateLimiter,
  userStoryCreateRateLimiter,
  userStoryReportRateLimiter,
  userSearchRateLimiter,
  userPhoneRevealRateLimiter,
  moneyMutationRateLimiter,
} from "../middlewares/index.js";
import {
  userIdParamValidation,
  updateProfileValidation,
  userSearchValidation,
  userSellerProductsValidation,
  submitDataConfirmationValidation,
  resolveDataConfirmationValidation,
  userFollowListValidation,
  userBlockListValidation,
  userStoryIdParamValidation,
  createUserStoryValidation,
  submitUserStoryReportValidation,
  resolveUserStoryReportsValidation,
  adminCreditLoyaltyPointsValidation,
  purchasePremiumValidation,
} from "../validations/index.js";

const router = createAsyncRouter();

router.get(
  "/search",
  checkAuthMW,
  userSearchRateLimiter,
  userSearchValidation,
  userSearchController,
);

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
  "/me/blocked-users",
  checkAuthMW,
  userBlockListValidation,
  listMyBlockedUsersController,
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
router.post(
  "/me/premium/purchase",
  checkAuthMW,
  moneyMutationRateLimiter,
  purchasePremiumValidation,
  purchasePremiumController,
);

router.get(
  "/me/loyalty-points/status",
  checkAuthMW,
  getMyLoyaltyPointsStatusController,
);

router.post(
  "/me/loyalty-points/admin-free-credit",
  checkAuthMW,
  checkAdminMW,
  adminCreditLoyaltyPointsValidation,
  adminCreditOwnLoyaltyPointsController,
);

router.get("/me/referral", checkAuthMW, getMyReferralProgramController);

router.get("/me/affiliate/earnings", checkAuthMW, getMyAffiliateEarningsController);

router.get("/loyalty-points/monthly-awarded", getMonthlyLoyaltyPointsAwardedController);

router.get(
  "/:userIdClient/phone",
  userPhoneRevealRateLimiter,
  userIdParamValidation,
  getUserPhoneController,
);
router.get(
  "/:userIdClient/purchases",
  checkAuthMW,
  userIdParamValidation,
  getUserPurchasesController,
);
router.get(
  "/:userIdClient/products",
  checkOptionalAuthMW,
  userIdParamValidation,
  userSellerProductsValidation,
  getUserProductsController,
);
router.get(
  "/:userIdClient/blocked-users",
  checkAuthMW,
  checkProductModeratorMW,
  userIdParamValidation,
  userBlockListValidation,
  listUserBlockedUsersModeratorController,
);
router.post(
  "/:userIdClient/block",
  checkAuthMW,
  updateProfileRateLimiter,
  userIdParamValidation,
  blockUserController,
);
router.delete(
  "/:userIdClient/block",
  checkAuthMW,
  updateProfileRateLimiter,
  userIdParamValidation,
  unblockUserController,
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
