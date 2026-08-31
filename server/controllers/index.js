import { uploadController } from "./User/uploadController.js";
import { getPrivateUploadController } from "./User/getPrivateUploadController.js";
import { uploadVideoController } from "./User/uploadVideoController.js";
import {
  registerUserController,
  confirmRegistrationController,
  resendRegistrationCodeController,
} from "./User/registerUserController.js";
import { loginUserController } from "./User/loginUserController.js";
import {
  registerPhoneUserController,
  loginPhonePasswordController,
  loginPhoneOtpRequestController,
  loginPhoneOtpConfirmController,
  phoneBindRequestController,
  phoneBindConfirmController,
} from "./User/phoneAuthControllers.js";
import { logoutUserController } from "./User/logoutUserController.js";
import { userMeController } from "./User/userMeController.js";
import { userGetProfileController } from "./User/userGetProfileController.js";
import { userUpdateProfileController } from "./User/userUpdateProfileController.js";
import { userDeleteProfileController } from "./User/userDeleteProfileController.js";
import { refreshAuthController } from "./User/refreshAuthController.js";
import {
  emailBindConfirmController,
  emailBindRequestController,
  resendEmailVerificationController,
  verifyEmailController,
  verifyEmailWithCodeController,
} from "./User/emailVerificationControllers.js";
import {
  passwordChangeController,
  passwordResetConfirmController,
  passwordResetRequestController,
} from "./User/passwordResetControllers.js";
import {
  userVoteRatingController,
  userGetRatingController,
  getMyVoteForTargetController,
} from "./User/userVoteRatingController.js";
import { userSearchController } from "./User/userSearchController.js";
import { getUserPurchasesController } from "./User/getUserPurchasesController.js";
import { getUserProductsController } from "./User/getUserProductsController.js";
import { getUserPhoneController } from "./User/getUserPhoneController.js";
import { makeOrderController } from "./Order/makeOrderController.js";
import { getMyOrdersController } from "./Order/getMyOrdersController.js";
import { getMySalesController } from "./Order/getMySalesController.js";
import {
  getMyOrdersActionCountController,
  getMySalesActionCountController,
} from "./Order/orderActionCountControllers.js";
import {
  getMyCourierProfileController,
  submitCourierApplicationController,
  getStaffCourierApplicationsController,
  patchStaffCourierModerationController,
} from "./Courier/courierApplicationController.js";
import {
  acceptShipmentController,
  completeDeliveryController,
  confirmHandoverController,
  issueHandoverCodeController,
  markArrivedController,
  startDeliveryController,
  getCourierOverviewController,
  raiseDeliveryFeeController,
  getMyCourierDeliveriesController,
  replaceShipmentCourierController,
} from "./Courier/courierShipmentController.js";
import { getAllOrdersController } from "./Order/getAllOrdersController.js";
import { updateOrderStatusController } from "./Order/updateOrderStatusController.js";
import {
  advanceMyShipmentStatusController,
  markOrderItemReturnedBySellerController,
  markOrderItemShippedBySellerController,
  markOrderItemDeliveredBySellerController,
  markOrderItemCancelledBySellerController,
  confirmOrderItemByBuyerController,
} from "./Order/updateOrderItemStatusController.js";
import {
  getProductCategoryDisplaysController,
  patchProductCategoryDisplayController,
  patchProductCategoryNodeDisplayController,
} from "./Product/productCategoryDisplayControllers.js";
import {
  getProductCatalogFeedTileDisplaysController,
  patchProductCatalogFeedTileDisplayController,
} from "./Product/productCatalogFeedTileDisplayControllers.js";
import {
  getProductManageToggleDisplaysController,
  patchProductManageToggleDisplayController,
} from "./Product/productManageToggleDisplayControllers.js";
import {
  getProductBadgeExplainsController,
  patchProductBadgeExplainController,
} from "./Product/productBadgeExplainControllers.js";
import {
  getProductCategoryRootsController,
  getProductCategorySearchController,
  getProductCategoryChildrenController,
  getProductCategoryBreadcrumbController,
} from "./Product/productCategoryTreeControllers.js";
import {
  listProductCategoriesAdminController,
  createProductCategoryAdminController,
  patchProductCategoryAdminController,
  deleteProductCategoryAdminController,
} from "./Product/productCategoryAdminControllers.js";
import {
  listProductSearchSynonymsAdminController,
  createProductSearchSynonymAdminController,
  patchProductSearchSynonymAdminController,
  deleteProductSearchSynonymAdminController,
} from "./Product/productSearchSynonymAdminControllers.js";
import { listStaffAuditLogController } from "./Audit/staffAuditControllers.js";
import {
  getAnalyticsExportController,
  getAnalyticsOverviewController,
  runAnalyticsReconciliationController,
} from "./Analytics/analyticsControllers.js";
import { trackAdAnalyticsController } from "./Analytics/trackAdAnalyticsController.js";
import {
  getHomeCuratedProductListsController,
  listCuratedProductListsAdminController,
  previewCuratedListProductAdminController,
  createCuratedProductListAdminController,
  reorderCuratedProductListsAdminController,
  patchCuratedProductListAdminController,
  deleteCuratedProductListAdminController,
  addCuratedProductListItemAdminController,
  removeCuratedProductListItemAdminController,
} from "./Product/curatedProductListControllers.js";
import {
  getHomeCuratedCategoryListsController,
  listCuratedCategoryListsAdminController,
  previewCuratedCategoryListItemAdminController,
  createCuratedCategoryListAdminController,
  reorderCuratedCategoryListsAdminController,
  patchCuratedCategoryListAdminController,
  deleteCuratedCategoryListAdminController,
  addCuratedCategoryListItemAdminController,
  removeCuratedCategoryListItemAdminController,
} from "./Product/curatedCategoryListControllers.js";
import { postProductController } from "./Product/postProductController.js";
import {
  downloadProductBulkImportTemplateController,
  getProductBulkImportJobStatusController,
  submitProductBulkImportController,
} from "./Product/productBulkImportControllers.js";
import {
  getProductsController,
  getMyProductsController,
} from "./Product/getProducts.js";
import { getCatalogProductByIdController } from "./Product/getCatalogProductByIdController.js";
import { getComparableProductsController } from "./Product/getComparableProductsController.js";
import { deleteMyProductController } from "./Product/deleteMyProductController.js";
import { patchMyProductController } from "./Product/patchMyProductController.js";
import { recordProductViewController } from "./Product/recordProductViewController.js";
import {
  getPendingModerationProductsController,
  getPendingModerationProductsCountController,
  approveProductModerationController,
  rejectProductModerationController,
} from "./Product/productModerationControllers.js";
import {
  submitProductReportController,
  getMyProductReportStatusController,
  getPendingProductReportsController,
  getPendingProductReportsCountController,
  resolveProductReportsForProductController,
} from "./Product/productReportControllers.js";
import {
  submitProductPriceOfferController,
  patchMyProductPriceOfferController,
  cancelMyProductPriceOfferController,
  getMyProductPriceOfferController,
  getTopProductPriceOffersController,
  getSellerProductPriceOffersController,
  acceptProductPriceOfferController,
  rejectProductPriceOfferController,
  getSellerProductPriceOfferArchiveController,
} from "./Product/productPriceOfferControllers.js";
import { getMyProductBuyNFreeProgressController } from "./Product/productBuyNFreeControllers.js";
import {
  getIncomingPriceOffersController,
  getIncomingPriceOffersPendingCountController,
  getMyPriceOfferBidsController,
} from "./Product/priceOfferDashboardControllers.js";
import {
  listProductReviewsController,
  getProductReviewSummaryController,
  submitProductReviewController,
  patchMyProductReviewController,
  deleteMyProductReviewController,
} from "./Product/productReviewControllers.js";
import {
  listProductQuestionsController,
  getProductQuestionSummaryController,
  askProductQuestionController,
  answerProductQuestionController,
  hideProductQuestionController,
  deleteMyProductQuestionController,
} from "./Product/productQuestionControllers.js";
import {
  getProductPromotionTariffsController,
  requestProductPromotionController,
  getMyProductPromotionsController,
  getPendingProductPromotionsController,
  getPendingProductPromotionsCountController,
  approveProductPromotionController,
  rejectProductPromotionController,
} from "./Product/productPromotionControllers.js";
import {
  listProductPromoCodesController,
  replaceProductPromoCodesController,
  activateProductPromoCodeController,
  listMyAppliedProductPromosController,
} from "./Product/productPromoCodeControllers.js";
import {
  getFeaturedRaffleController,
  getRaffleByIdController,
  getRaffleProductsController,
  createRaffleController,
  getMyRaffleController,
  getRaffleCreateAdvertisingController,
  unlockRaffleCreateController,
  cancelRaffleCreateController,
  patchMyRaffleController,
  patchRaffleByStaffController,
  deleteMyRaffleController,
  deleteRaffleByStaffController,
  pauseMyRaffleController,
  setProductRaffleParticipationController,
  getPendingRafflesController,
  getPendingRafflesCountController,
  approveRaffleController,
  rejectRaffleController,
} from "./Raffle/raffleControllers.js";
import { markInAppNotificationsReadController } from "./User/markInAppNotificationsReadController.js";
import {
  registerPushTokenController,
  removePushTokenController,
} from "./User/pushTokenControllers.js";
import {
  getWebPushVapidPublicKeyController,
  registerWebPushSubscriptionController,
  removeWebPushSubscriptionController,
} from "./User/webPushSubscriptionControllers.js";
import {
  getStaffBroadcastRecipientsCountController,
  postStaffBroadcastNotificationController,
} from "./User/staffBroadcastNotificationControllers.js";
import {
  submitDataConfirmationRequestController,
  getMyDataConfirmationRequestController,
  getPendingDataConfirmationRequestsController,
  getPendingDataConfirmationRequestsCountController,
  resolveDataConfirmationRequestController,
} from "./User/userDataConfirmationControllers.js";
import {
  getMyPremiumStatusController,
  purchasePremiumController,
} from "./User/premiumControllers.js";
import {
  getMyLoyaltyPointsStatusController,
  adminCreditOwnLoyaltyPointsController,
} from "./User/loyaltyPointsPurchaseControllers.js";
import { getMyReferralProgramController } from "./User/referralControllers.js";
import { getMyAffiliateEarningsController } from "./User/affiliateControllers.js";
import { getMonthlyLoyaltyPointsAwardedController } from "./User/monthlyLoyaltyPointsControllers.js";
import {
  followUserController,
  unfollowUserController,
  listMyFollowingController,
  listMyFollowersController,
} from "./User/userFollowControllers.js";
import {
  blockUserController,
  unblockUserController,
  listMyBlockedUsersController,
  listUserBlockedUsersModeratorController,
} from "./User/userBlockControllers.js";
import { getMyCartController } from "./Cart/getMyCartController.js";
import { replaceMyCartController } from "./Cart/replaceMyCartController.js";
import { getMyFavoritesController } from "./Favorites/getMyFavoritesController.js";
import { replaceMyFavoritesController } from "./Favorites/replaceMyFavoritesController.js";
import {
  getUserStoriesFeedController,
  getUserStoriesByAuthorController,
  createUserStoryController,
  deleteUserStoryController,
  markUserStoryViewedController,
  submitUserStoryReportController,
  getPendingUserStoryReportsController,
  getPendingUserStoryReportsCountController,
  resolveUserStoryReportsController,
} from "./User/userStoryControllers.js";
import {
  getProductInstallmentProgramController,
  upsertProductInstallmentProgramController,
} from "./Product/productInstallmentControllers.js";
import {
  createInstallmentContractController,
  getMyInstallmentContractsController,
  getMyInstallmentSalesController,
  getInstallmentBuyerActionCountController,
  getInstallmentSellerActionCountController,
  markInstallmentPaymentPaidController,
  confirmInstallmentPaymentController,
  rejectInstallmentPaymentController,
  markInstallmentEarlyPayoffController,
  rejectInstallmentEarlyPayoffController,
  cancelInstallmentEarlyPayoffController,
  confirmInstallmentEarlyPayoffController,
  cancelInstallmentContractController,
  sendInstallmentSellerMessageController,
  openInstallmentDisputeController,
  getPendingInstallmentDisputesController,
  getPendingInstallmentDisputesCountController,
  resolveInstallmentDisputeController,
} from "./Installment/installmentContractControllers.js";

export {
  uploadController,
  getPrivateUploadController,
  uploadVideoController,
  registerUserController,
  confirmRegistrationController,
  resendRegistrationCodeController,
  loginUserController,
  registerPhoneUserController,
  loginPhonePasswordController,
  loginPhoneOtpRequestController,
  loginPhoneOtpConfirmController,
  phoneBindRequestController,
  phoneBindConfirmController,
  logoutUserController,
  refreshAuthController,
  verifyEmailController,
  resendEmailVerificationController,
  verifyEmailWithCodeController,
  emailBindRequestController,
  emailBindConfirmController,
  passwordResetRequestController,
  passwordResetConfirmController,
  passwordChangeController,
  userVoteRatingController,
  userGetRatingController,
  getMyVoteForTargetController,
  userGetProfileController,
  userMeController,
  userUpdateProfileController,
  userDeleteProfileController,
  userSearchController,
  getUserPurchasesController,
  getUserProductsController,
  getUserPhoneController,
  makeOrderController,
  getMyOrdersController,
  getMySalesController,
  getMyOrdersActionCountController,
  getMySalesActionCountController,
  getAllOrdersController,
  updateOrderStatusController,
  getMyCourierProfileController,
  submitCourierApplicationController,
  getStaffCourierApplicationsController,
  patchStaffCourierModerationController,
  acceptShipmentController,
  completeDeliveryController,
  confirmHandoverController,
  issueHandoverCodeController,
  markArrivedController,
  startDeliveryController,
  getCourierOverviewController,
  raiseDeliveryFeeController,
  getMyCourierDeliveriesController,
  replaceShipmentCourierController,
  advanceMyShipmentStatusController,
  markOrderItemReturnedBySellerController,
  markOrderItemShippedBySellerController,
  markOrderItemDeliveredBySellerController,
  markOrderItemCancelledBySellerController,
  confirmOrderItemByBuyerController,
  getProductCategoryDisplaysController,
  patchProductCategoryDisplayController,
  patchProductCategoryNodeDisplayController,
  getProductCatalogFeedTileDisplaysController,
  patchProductCatalogFeedTileDisplayController,
  getProductManageToggleDisplaysController,
  patchProductManageToggleDisplayController,
  getProductBadgeExplainsController,
  patchProductBadgeExplainController,
  getProductCategoryRootsController,
  getProductCategorySearchController,
  getProductCategoryChildrenController,
  getProductCategoryBreadcrumbController,
  listProductCategoriesAdminController,
  createProductCategoryAdminController,
  patchProductCategoryAdminController,
  deleteProductCategoryAdminController,
  listProductSearchSynonymsAdminController,
  createProductSearchSynonymAdminController,
  patchProductSearchSynonymAdminController,
  deleteProductSearchSynonymAdminController,
  getHomeCuratedProductListsController,
  listCuratedProductListsAdminController,
  previewCuratedListProductAdminController,
  createCuratedProductListAdminController,
  reorderCuratedProductListsAdminController,
  patchCuratedProductListAdminController,
  deleteCuratedProductListAdminController,
  addCuratedProductListItemAdminController,
  removeCuratedProductListItemAdminController,
  getHomeCuratedCategoryListsController,
  listCuratedCategoryListsAdminController,
  previewCuratedCategoryListItemAdminController,
  createCuratedCategoryListAdminController,
  reorderCuratedCategoryListsAdminController,
  patchCuratedCategoryListAdminController,
  deleteCuratedCategoryListAdminController,
  addCuratedCategoryListItemAdminController,
  removeCuratedCategoryListItemAdminController,
  postProductController,
  downloadProductBulkImportTemplateController,
  submitProductBulkImportController,
  getProductBulkImportJobStatusController,
  getProductsController,
  getMyProductsController,
  getCatalogProductByIdController,
  getComparableProductsController,
  deleteMyProductController,
  patchMyProductController,
  recordProductViewController,
  getPendingModerationProductsController,
  getPendingModerationProductsCountController,
  approveProductModerationController,
  rejectProductModerationController,
  submitProductReportController,
  getMyProductReportStatusController,
  getPendingProductReportsController,
  getPendingProductReportsCountController,
  resolveProductReportsForProductController,
  submitProductPriceOfferController,
  patchMyProductPriceOfferController,
  cancelMyProductPriceOfferController,
  getMyProductPriceOfferController,
  getMyProductBuyNFreeProgressController,
  getTopProductPriceOffersController,
  getSellerProductPriceOffersController,
  acceptProductPriceOfferController,
  rejectProductPriceOfferController,
  getSellerProductPriceOfferArchiveController,
  getMyPriceOfferBidsController,
  getIncomingPriceOffersController,
  getIncomingPriceOffersPendingCountController,
  listProductReviewsController,
  getProductReviewSummaryController,
  listProductQuestionsController,
  getProductQuestionSummaryController,
  askProductQuestionController,
  answerProductQuestionController,
  hideProductQuestionController,
  deleteMyProductQuestionController,
  submitProductReviewController,
  patchMyProductReviewController,
  deleteMyProductReviewController,
  getProductPromotionTariffsController,
  requestProductPromotionController,
  getMyProductPromotionsController,
  getPendingProductPromotionsController,
  getPendingProductPromotionsCountController,
  approveProductPromotionController,
  rejectProductPromotionController,
  listProductPromoCodesController,
  replaceProductPromoCodesController,
  activateProductPromoCodeController,
  listMyAppliedProductPromosController,
  getFeaturedRaffleController,
  getRaffleByIdController,
  getRaffleProductsController,
  createRaffleController,
  getMyRaffleController,
  getRaffleCreateAdvertisingController,
  unlockRaffleCreateController,
  cancelRaffleCreateController,
  patchMyRaffleController,
  patchRaffleByStaffController,
  deleteMyRaffleController,
  deleteRaffleByStaffController,
  pauseMyRaffleController,
  setProductRaffleParticipationController,
  getPendingRafflesController,
  getPendingRafflesCountController,
  approveRaffleController,
  rejectRaffleController,
  markInAppNotificationsReadController,
  registerPushTokenController,
  removePushTokenController,
  getWebPushVapidPublicKeyController,
  registerWebPushSubscriptionController,
  removeWebPushSubscriptionController,
  getStaffBroadcastRecipientsCountController,
  postStaffBroadcastNotificationController,
  submitDataConfirmationRequestController,
  getMyDataConfirmationRequestController,
  getPendingDataConfirmationRequestsController,
  getPendingDataConfirmationRequestsCountController,
  resolveDataConfirmationRequestController,
  getMyPremiumStatusController,
  purchasePremiumController,
  getMyLoyaltyPointsStatusController,
  adminCreditOwnLoyaltyPointsController,
  getMyReferralProgramController,
  getMyAffiliateEarningsController,
  getMonthlyLoyaltyPointsAwardedController,
  followUserController,
  unfollowUserController,
  listMyFollowingController,
  listMyFollowersController,
  blockUserController,
  unblockUserController,
  listMyBlockedUsersController,
  listUserBlockedUsersModeratorController,
  getMyCartController,
  replaceMyCartController,
  getMyFavoritesController,
  replaceMyFavoritesController,
  getUserStoriesFeedController,
  getUserStoriesByAuthorController,
  createUserStoryController,
  deleteUserStoryController,
  markUserStoryViewedController,
  submitUserStoryReportController,
  getPendingUserStoryReportsController,
  getPendingUserStoryReportsCountController,
  resolveUserStoryReportsController,
  getProductInstallmentProgramController,
  upsertProductInstallmentProgramController,
  createInstallmentContractController,
  getMyInstallmentContractsController,
  getMyInstallmentSalesController,
  getInstallmentBuyerActionCountController,
  getInstallmentSellerActionCountController,
  markInstallmentPaymentPaidController,
  confirmInstallmentPaymentController,
  rejectInstallmentPaymentController,
  markInstallmentEarlyPayoffController,
  rejectInstallmentEarlyPayoffController,
  cancelInstallmentEarlyPayoffController,
  confirmInstallmentEarlyPayoffController,
  cancelInstallmentContractController,
  sendInstallmentSellerMessageController,
  openInstallmentDisputeController,
  getPendingInstallmentDisputesController,
  getPendingInstallmentDisputesCountController,
  resolveInstallmentDisputeController,
  listStaffAuditLogController,
  getAnalyticsOverviewController,
  getAnalyticsExportController,
  runAnalyticsReconciliationController,
  trackAdAnalyticsController,
};
