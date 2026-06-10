import { uploadController } from "./User/uploadController.js";
import { uploadVideoController } from "./User/uploadVideoController.js";
import { registerUserController } from "./User/registerUserController.js";
import {
  loginUserController,
  logoutUserController,
  userGetProfileController,
  userMeController,
  userUpdateProfileController,
  userDeleteProfileController,
} from "./User/loginUserController.js";
import { refreshAuthController } from "./User/refreshAuthController.js";
import {
  resendEmailVerificationController,
  verifyEmailController,
  verifyEmailWithCodeController,
} from "./User/emailVerificationControllers.js";
import {
  userVoteRatingController,
  userGetRatingController,
  getMyVoteForTargetController,
} from "./User/userVoteRatingController.js";
import { userSearchController } from "./User/userSearchController.js";
import { getUserPurchasesController } from "./User/getUserPurchasesController.js";
import { getUserProductsController } from "./User/getUserProductsController.js";
import { makeOrderController } from "./Order/makeOrderController.js";
import { getMyOrdersController } from "./Order/getMyOrdersController.js";
import { getMySalesController } from "./Order/getMySalesController.js";
import {
  getMyOrdersActionCountController,
  getMySalesActionCountController,
} from "./Order/orderActionCountControllers.js";
import { getAllOrdersController } from "./Order/getAllOrdersController.js";
import { updateOrderStatusController } from "./Order/updateOrderStatusController.js";
import {
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
  getProductCategoryRootsController,
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
import { postProductController } from "./Product/postProductController.js";
import {
  getProductsController,
  getMyProductsController,
} from "./Product/getProducts.js";
import { getCatalogProductByIdController } from "./Product/getCatalogProductByIdController.js";
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
  getProductPromotionTariffsController,
  requestProductPromotionController,
  getMyProductPromotionsController,
} from "./Product/productPromotionControllers.js";
import {
  getFeaturedRaffleController,
  getRaffleByIdController,
  getRaffleProductsController,
  createRaffleController,
  getMyRaffleController,
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
import { getMyLoyaltyPointsStatusController } from "./User/loyaltyPointsPurchaseControllers.js";
import {
  followUserController,
  unfollowUserController,
  listMyFollowingController,
  listMyFollowersController,
} from "./User/userFollowControllers.js";
import { getMyCartController } from "./Cart/getMyCartController.js";
import { replaceMyCartController } from "./Cart/replaceMyCartController.js";
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
  getPendingInstallmentModerationController,
  getPendingInstallmentModerationCountController,
  approveInstallmentModerationController,
  rejectInstallmentModerationController,
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
  uploadVideoController,
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshAuthController,
  verifyEmailController,
  resendEmailVerificationController,
  verifyEmailWithCodeController,
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
  makeOrderController,
  getMyOrdersController,
  getMySalesController,
  getMyOrdersActionCountController,
  getMySalesActionCountController,
  getAllOrdersController,
  updateOrderStatusController,
  markOrderItemShippedBySellerController,
  markOrderItemDeliveredBySellerController,
  markOrderItemCancelledBySellerController,
  confirmOrderItemByBuyerController,
  getProductCategoryDisplaysController,
  patchProductCategoryDisplayController,
  patchProductCategoryNodeDisplayController,
  getProductCatalogFeedTileDisplaysController,
  patchProductCatalogFeedTileDisplayController,
  getProductCategoryRootsController,
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
  postProductController,
  getProductsController,
  getMyProductsController,
  getCatalogProductByIdController,
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
  submitProductReviewController,
  patchMyProductReviewController,
  deleteMyProductReviewController,
  getProductPromotionTariffsController,
  requestProductPromotionController,
  getMyProductPromotionsController,
  getFeaturedRaffleController,
  getRaffleByIdController,
  getRaffleProductsController,
  createRaffleController,
  getMyRaffleController,
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
  submitDataConfirmationRequestController,
  getMyDataConfirmationRequestController,
  getPendingDataConfirmationRequestsController,
  getPendingDataConfirmationRequestsCountController,
  resolveDataConfirmationRequestController,
  getMyPremiumStatusController,
  purchasePremiumController,
  getMyLoyaltyPointsStatusController,
  followUserController,
  unfollowUserController,
  listMyFollowingController,
  listMyFollowersController,
  getMyCartController,
  replaceMyCartController,
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
  getPendingInstallmentModerationController,
  getPendingInstallmentModerationCountController,
  approveInstallmentModerationController,
  rejectInstallmentModerationController,
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
};
