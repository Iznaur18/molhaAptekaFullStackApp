import { staffAuditListValidation } from "./audit/staffAuditListValidation.js";
import { analyticsPeriodQueryValidation } from "./analytics/analyticsPeriodQueryValidation.js";
import { trackAdAnalyticsValidation } from "./analytics/trackAdAnalyticsValidation.js";
import { loginUserValidation } from "./user/loginUserValidation.js";
import { registerUserValidation } from "./user/registerUserValidation.js";
import { updateProfileValidation } from "./user/updateProfileValidation.js";
import { userIdParamValidation } from "./user/userIdParamValidation.js";
import { voteValidation, voteTargetIdParamValidation } from "./user/voteValidation.js";
import { ratingUserIdParamValidation } from "./user/ratingValidation.js";
import { userSearchValidation } from "./user/userSearchValidation.js";
import { userSellerProductsValidation } from "./user/userSellerProductsValidation.js";
import { submitDataConfirmationValidation } from "./user/submitDataConfirmationValidation.js";
import { resolveDataConfirmationValidation } from "./user/resolveDataConfirmationValidation.js";
import { userFollowListValidation } from "./user/userFollowListValidation.js";
import { userBlockListValidation } from "./user/userBlockValidation.js";
import {
  registerPushTokenValidation,
  removePushTokenValidation,
} from "./user/pushTokenValidation.js";
import { refreshAuthValidation } from "./user/refreshAuthValidation.js";
import { verifyEmailTokenValidation } from "./user/verifyEmailTokenValidation.js";
import { adminCreditLoyaltyPointsValidation } from "./user/adminCreditLoyaltyPointsValidation.js";
import { purchasePremiumValidation } from "./user/purchasePremiumValidation.js";
import { makeProductValidation } from "./product/makeProductValidation.js";
import { productBulkImportJobIdParamValidation } from "./product/productBulkImportValidation.js";
import { productIdParamValidation } from "./product/productIdParamValidation.js";
import { productsSearchValidation } from "./product/productsSearchValidation.js";
import { patchMyProductValidation } from "./product/patchMyProductValidation.js";
import { rejectProductModerationValidation } from "./product/rejectProductModerationValidation.js";
import { submitProductReportValidation } from "./product/submitProductReportValidation.js";
import { resolveProductReportsValidation } from "./product/resolveProductReportsValidation.js";
import {
  submitProductPriceOfferValidation,
  patchProductPriceOfferValidation,
  productPriceOfferIdParamValidation,
} from "./product/productPriceOfferValidation.js";
import {
  submitProductReviewValidation,
  patchProductReviewValidation,
  productReviewsListValidation,
} from "./product/productReviewValidation.js";
import {
  askProductQuestionValidation,
  answerProductQuestionValidation,
  productQuestionsListValidation,
  productQuestionIdParamValidation,
} from "./product/productQuestionValidation.js";
import {
  requestProductPromotionValidation,
  myProductPromotionsValidation,
  promotionIdParamValidation,
  rejectProductPromotionValidation,
} from "./product/productPromotionValidation.js";
import {
  replaceProductPromoCodesValidation,
  activateProductPromoCodeValidation,
} from "./product/productPromoCodeValidation.js";
import {
  createRaffleValidation,
  patchRaffleValidation,
  raffleIdParamValidation,
  rejectRaffleValidation,
  raffleProductsValidation,
  setProductRaffleParticipationValidation,
} from "./raffle/raffleValidation.js";
import { makeOrderValidation } from "./order/makeOrderValidation.js";
import { updateOrderStatusValidation } from "./order/updateOrderStatusValidation.js";
import { getAllOrdersValidation } from "./order/getAllOrdersValidation.js";
import { getMySalesValidation } from "./order/getMySalesValidation.js";
import { getMyOrdersValidation } from "./order/getMyOrdersValidation.js";
import { orderItemActionValidation } from "./order/orderItemActionValidation.js";
import { orderItemCancelValidation } from "./order/orderItemCancelValidation.js";
import { advanceShipmentStatusValidation } from "./order/advanceShipmentStatusValidation.js";
import {
  courierApplicationValidation,
  staffCourierListValidation,
  staffCourierModerationValidation,
} from "./courier/courierApplicationValidation.js";
import { replaceMyCartValidation } from "./cart/replaceMyCartValidation.js";
import { replaceMyFavoritesValidation } from "./favorites/replaceMyFavoritesValidation.js";
import {
  userStoryIdParamValidation,
  createUserStoryValidation,
  submitUserStoryReportValidation,
  resolveUserStoryReportsValidation,
} from "./user/userStoryValidation.js";

import {
  productCategorySlugParamValidation,
  patchProductCategoryDisplayValidation,
  patchProductCategoryNodeDisplayValidation,
} from "./product/productCategoryDisplayValidation.js";
import { productCategoryIdParamValidation } from "./product/productCategoryTreeValidation.js";
import {
  createProductCategoryAdminValidation,
  deleteProductCategoryAdminValidation,
  patchProductCategoryAdminValidation,
} from "./product/productCategoryAdminValidation.js";
import {
  productSearchSynonymIdParamValidation,
  createProductSearchSynonymValidation,
  patchProductSearchSynonymValidation,
} from "./product/productSearchSynonymAdminValidation.js";
import {
  curatedProductListIdParamValidation,
  curatedProductListProductIdParamValidation,
  curatedProductPreviewParamValidation,
  createCuratedProductListValidation,
  patchCuratedProductListValidation,
  reorderCuratedProductListsValidation,
  addCuratedProductListItemValidation,
} from "./product/curatedProductListValidation.js";
import {
  curatedCategoryListIdParamValidation,
  curatedCategoryListItemParamValidation,
  curatedCategoryItemPreviewQueryValidation,
  createCuratedCategoryListValidation,
  patchCuratedCategoryListValidation,
  reorderCuratedCategoryListsValidation,
  addCuratedCategoryListItemValidation,
} from "./product/curatedCategoryListValidation.js";
import {
  catalogFeedTileKeyParamValidation,
  patchProductCatalogFeedTileDisplayValidation,
} from "./product/productCatalogFeedTileDisplayValidation.js";
import {
  productManageToggleKeyParamValidation,
  patchProductManageToggleDisplayValidation,
} from "./product/productManageToggleDisplayValidation.js";
import {
  productBadgeExplainKeyParamValidation,
  patchProductBadgeExplainValidation,
} from "./product/productBadgeExplainValidation.js";
import { patchAppIntroSettingsValidation } from "./appIntro/appIntroSettingsValidation.js";
import {
  upsertProductInstallmentProgramValidation,
  createInstallmentContractValidation,
  installmentContractIdParamValidation,
  installmentPaymentIndexParamValidation,
  installmentSellerMessageValidation,
  installmentDisputeValidation,
  installmentDisputeIdParamValidation,
  resolveInstallmentDisputeValidation,
  installmentCancelValidation,
  installmentIdempotencyBodyValidation,
} from "./product/installmentValidation.js";
import {
  getMyInstallmentContractsListValidation,
  getMyInstallmentSalesValidation,
} from "./product/getMyInstallmentSalesValidation.js";

export {
  loginUserValidation,
  registerUserValidation,
  updateProfileValidation,
  userIdParamValidation,
  voteValidation,
  voteTargetIdParamValidation,
  ratingUserIdParamValidation,
  userSearchValidation,
  userSellerProductsValidation,
  submitDataConfirmationValidation,
  resolveDataConfirmationValidation,
  userFollowListValidation,
  userBlockListValidation,
  refreshAuthValidation,
  verifyEmailTokenValidation,
  adminCreditLoyaltyPointsValidation,
  purchasePremiumValidation,
  registerPushTokenValidation,
  removePushTokenValidation,
  makeProductValidation,
  productBulkImportJobIdParamValidation,
  productIdParamValidation,
  productsSearchValidation,
  patchMyProductValidation,
  rejectProductModerationValidation,
  submitProductReportValidation,
  resolveProductReportsValidation,
  submitProductPriceOfferValidation,
  patchProductPriceOfferValidation,
  productPriceOfferIdParamValidation,
  submitProductReviewValidation,
  patchProductReviewValidation,
  productReviewsListValidation,
  askProductQuestionValidation,
  answerProductQuestionValidation,
  productQuestionsListValidation,
  productQuestionIdParamValidation,
  requestProductPromotionValidation,
  myProductPromotionsValidation,
  promotionIdParamValidation,
  rejectProductPromotionValidation,
  replaceProductPromoCodesValidation,
  activateProductPromoCodeValidation,
  createRaffleValidation,
  patchRaffleValidation,
  raffleIdParamValidation,
  rejectRaffleValidation,
  raffleProductsValidation,
  setProductRaffleParticipationValidation,
  makeOrderValidation,
  updateOrderStatusValidation,
  getAllOrdersValidation,
  getMySalesValidation,
  getMyOrdersValidation,
  orderItemActionValidation,
  orderItemCancelValidation,
  advanceShipmentStatusValidation,
  courierApplicationValidation,
  staffCourierListValidation,
  staffCourierModerationValidation,
  replaceMyCartValidation,
  replaceMyFavoritesValidation,
  userStoryIdParamValidation,
  createUserStoryValidation,
  submitUserStoryReportValidation,
  resolveUserStoryReportsValidation,
  productCategorySlugParamValidation,
  patchProductCategoryDisplayValidation,
  patchProductCategoryNodeDisplayValidation,
  productCategoryIdParamValidation,
  createProductCategoryAdminValidation,
  deleteProductCategoryAdminValidation,
  patchProductCategoryAdminValidation,
  productSearchSynonymIdParamValidation,
  createProductSearchSynonymValidation,
  patchProductSearchSynonymValidation,
  curatedProductListIdParamValidation,
  curatedProductListProductIdParamValidation,
  curatedProductPreviewParamValidation,
  createCuratedProductListValidation,
  patchCuratedProductListValidation,
  reorderCuratedProductListsValidation,
  addCuratedProductListItemValidation,
  curatedCategoryListIdParamValidation,
  curatedCategoryListItemParamValidation,
  curatedCategoryItemPreviewQueryValidation,
  createCuratedCategoryListValidation,
  patchCuratedCategoryListValidation,
  reorderCuratedCategoryListsValidation,
  addCuratedCategoryListItemValidation,
  catalogFeedTileKeyParamValidation,
  patchProductCatalogFeedTileDisplayValidation,
  productManageToggleKeyParamValidation,
  patchProductManageToggleDisplayValidation,
  productBadgeExplainKeyParamValidation,
  patchProductBadgeExplainValidation,
  patchAppIntroSettingsValidation,
  upsertProductInstallmentProgramValidation,
  createInstallmentContractValidation,
  installmentContractIdParamValidation,
  installmentPaymentIndexParamValidation,
  installmentSellerMessageValidation,
  installmentDisputeValidation,
  installmentDisputeIdParamValidation,
  resolveInstallmentDisputeValidation,
  installmentCancelValidation,
  installmentIdempotencyBodyValidation,
  getMyInstallmentContractsListValidation,
  getMyInstallmentSalesValidation,
  staffAuditListValidation,
  analyticsPeriodQueryValidation,
  trackAdAnalyticsValidation,
};
