import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
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
} from "../controllers/index.js";
import { checkAuthMW, checkProductModeratorMW } from "../middlewares/index.js";
import {
  installmentContractIdParamValidation,
  installmentPaymentIndexParamValidation,
  installmentSellerMessageValidation,
  installmentDisputeValidation,
  installmentDisputeIdParamValidation,
  resolveInstallmentDisputeValidation,
  installmentCancelValidation,
  getMyInstallmentContractsListValidation,
  getMyInstallmentSalesValidation,
} from "../validations/index.js";

const router = createAsyncRouter();

router.get(
  "/contracts/my",
  checkAuthMW,
  getMyInstallmentContractsListValidation,
  getMyInstallmentContractsController,
);
router.get(
  "/contracts/my/action-count",
  checkAuthMW,
  getInstallmentBuyerActionCountController,
);
router.get(
  "/contracts/sales",
  checkAuthMW,
  getMyInstallmentSalesValidation,
  getMyInstallmentSalesController,
);
router.get(
  "/contracts/sales/action-count",
  checkAuthMW,
  getInstallmentSellerActionCountController,
);

router.patch(
  "/contracts/:contractId/payments/:paymentIndex/mark-paid",
  checkAuthMW,
  installmentPaymentIndexParamValidation,
  markInstallmentPaymentPaidController,
);
router.patch(
  "/contracts/:contractId/payments/:paymentIndex/confirm",
  checkAuthMW,
  installmentPaymentIndexParamValidation,
  confirmInstallmentPaymentController,
);
router.patch(
  "/contracts/:contractId/payments/:paymentIndex/reject",
  checkAuthMW,
  installmentPaymentIndexParamValidation,
  rejectInstallmentPaymentController,
);
router.patch(
  "/contracts/:contractId/pay-early",
  checkAuthMW,
  installmentContractIdParamValidation,
  markInstallmentEarlyPayoffController,
);
router.patch(
  "/contracts/:contractId/pay-early/cancel",
  checkAuthMW,
  installmentContractIdParamValidation,
  cancelInstallmentEarlyPayoffController,
);
router.patch(
  "/contracts/:contractId/pay-early/reject",
  checkAuthMW,
  installmentContractIdParamValidation,
  rejectInstallmentEarlyPayoffController,
);
router.patch(
  "/contracts/:contractId/pay-early/confirm",
  checkAuthMW,
  installmentContractIdParamValidation,
  confirmInstallmentEarlyPayoffController,
);
router.patch(
  "/contracts/:contractId/cancel",
  checkAuthMW,
  installmentContractIdParamValidation,
  installmentCancelValidation,
  cancelInstallmentContractController,
);
router.post(
  "/contracts/:contractId/message",
  checkAuthMW,
  installmentContractIdParamValidation,
  installmentSellerMessageValidation,
  sendInstallmentSellerMessageController,
);
router.post(
  "/contracts/:contractId/dispute",
  checkAuthMW,
  installmentContractIdParamValidation,
  installmentDisputeValidation,
  openInstallmentDisputeController,
);

router.get(
  "/disputes/pending",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingInstallmentDisputesController,
);
router.get(
  "/disputes/pending/count",
  checkAuthMW,
  checkProductModeratorMW,
  getPendingInstallmentDisputesCountController,
);
router.patch(
  "/disputes/:disputeId/resolve",
  checkAuthMW,
  checkProductModeratorMW,
  installmentDisputeIdParamValidation,
  resolveInstallmentDisputeValidation,
  resolveInstallmentDisputeController,
);

export { router as installmentRouter };
