import {
  cancelInstallmentContract,
  cancelInstallmentEarlyPayoff,
  confirmInstallmentEarlyPayoff,
  confirmInstallmentPayment,
  countPendingInstallmentDisputes,
  createInstallmentContract,
  getInstallmentBuyerActionCount,
  getInstallmentSellerActionCount,
  listInstallmentContracts,
  listPendingInstallmentDisputes,
  markInstallmentEarlyPayoff,
  markInstallmentPaymentPaid,
  openInstallmentDispute,
  rejectInstallmentEarlyPayoff,
  rejectInstallmentPayment,
  resolveInstallmentDispute,
  sendInstallmentSellerMessage,
} from "../../services/installment/index.js";
import { successRes } from "../../services/http/index.js";

/** `POST /product/:productId/installment-contracts` */
export const createInstallmentContractController = async (req, res) => {
  const result = await createInstallmentContract({
    buyerUserId: req.userId,
    productId: req.params.productId,
    planId: req.body.planId,
    quantity: req.body.quantity,
    paymentMethod: req.body.paymentMethod,
    passportShareConsent: req.body.passportShareConsent,
    verifiedDeliveryAddress: req.verifiedDeliveryAddress,
  });

  return successRes(res, result);
};

/** `GET /installment/contracts/my` */
export const getMyInstallmentContractsController = async (req, res) => {
  const result = await listInstallmentContracts({
    userId: req.userId,
    statusFilter: req.query.status,
    role: "buyer",
    page: req.query.page,
    limit: req.query.limit,
  });

  return successRes(res, result);
};

/** `GET /installment/contracts/sales` */
export const getMyInstallmentSalesController = async (req, res) => {
  const result = await listInstallmentContracts({
    userId: req.userId,
    statusFilter: req.query.status,
    role: "seller",
    page: req.query.page,
    limit: req.query.limit,
  });

  return successRes(res, result);
};

/** `PATCH /installment/contracts/:contractId/payments/:paymentIndex/mark-paid` */
export const markInstallmentPaymentPaidController = async (req, res) => {
  const result = await markInstallmentPaymentPaid({
    userId: req.userId,
    contractId: req.params.contractId,
    paymentIndex: req.params.paymentIndex,
    idempotencyKey: req.body?.idempotencyKey,
  });

  return successRes(res, result);
};

/** `PATCH /installment/contracts/:contractId/payments/:paymentIndex/reject` */
export const rejectInstallmentPaymentController = async (req, res) => {
  const result = await rejectInstallmentPayment({
    userId: req.userId,
    contractId: req.params.contractId,
    paymentIndex: req.params.paymentIndex,
    idempotencyKey: req.body?.idempotencyKey,
  });

  return successRes(res, result);
};

/** `PATCH /installment/contracts/:contractId/pay-early/reject` */
export const rejectInstallmentEarlyPayoffController = async (req, res) => {
  const result = await rejectInstallmentEarlyPayoff({
    userId: req.userId,
    contractId: req.params.contractId,
    idempotencyKey: req.body?.idempotencyKey,
  });

  return successRes(res, result);
};

/** `PATCH /installment/contracts/:contractId/payments/:paymentIndex/confirm` */
export const confirmInstallmentPaymentController = async (req, res) => {
  const result = await confirmInstallmentPayment({
    userId: req.userId,
    contractId: req.params.contractId,
    paymentIndex: req.params.paymentIndex,
    idempotencyKey: req.body?.idempotencyKey,
  });

  return successRes(res, result);
};

/** `PATCH /installment/contracts/:contractId/pay-early` */
export const markInstallmentEarlyPayoffController = async (req, res) => {
  const result = await markInstallmentEarlyPayoff({
    userId: req.userId,
    contractId: req.params.contractId,
    idempotencyKey: req.body?.idempotencyKey,
  });

  return successRes(res, result);
};

/** `PATCH /installment/contracts/:contractId/pay-early/cancel` */
export const cancelInstallmentEarlyPayoffController = async (req, res) => {
  const result = await cancelInstallmentEarlyPayoff({
    userId: req.userId,
    contractId: req.params.contractId,
    idempotencyKey: req.body?.idempotencyKey,
  });

  return successRes(res, result);
};

/** `PATCH /installment/contracts/:contractId/pay-early/confirm` */
export const confirmInstallmentEarlyPayoffController = async (req, res) => {
  const result = await confirmInstallmentEarlyPayoff({
    userId: req.userId,
    contractId: req.params.contractId,
    idempotencyKey: req.body?.idempotencyKey,
  });

  return successRes(res, result);
};

/** `PATCH /installment/contracts/:contractId/cancel` */
export const cancelInstallmentContractController = async (req, res) => {
  const result = await cancelInstallmentContract({
    userId: req.userId,
    contractId: req.params.contractId,
    reason: req.body?.reason,
  });

  return successRes(res, result);
};

/** `POST /installment/contracts/:contractId/message` */
export const sendInstallmentSellerMessageController = async (req, res) => {
  const result = await sendInstallmentSellerMessage({
    userId: req.userId,
    contractId: req.params.contractId,
    message: req.body?.message,
  });

  return successRes(res, result);
};

/** `POST /installment/contracts/:contractId/dispute` */
export const openInstallmentDisputeController = async (req, res) => {
  const result = await openInstallmentDispute({
    userId: req.userId,
    contractId: req.params.contractId,
    reason: req.body?.reason,
  });

  return successRes(res, result);
};

/** `GET /installment/disputes/pending` */
export const getPendingInstallmentDisputesController = async (req, res) => {
  const disputes = await listPendingInstallmentDisputes();
  return successRes(res, { disputes });
};

/** `GET /installment/disputes/pending/count` */
export const getPendingInstallmentDisputesCountController = async (req, res) => {
  const count = await countPendingInstallmentDisputes();
  return successRes(res, { count });
};

/** `GET /installment/contracts/my/action-count` */
export const getInstallmentBuyerActionCountController = async (req, res) => {
  const count = await getInstallmentBuyerActionCount(req.userId);
  return successRes(res, { count });
};

/** `GET /installment/contracts/sales/action-count` */
export const getInstallmentSellerActionCountController = async (req, res) => {
  const count = await getInstallmentSellerActionCount(req.userId);
  return successRes(res, { count });
};

/** `PATCH /installment/disputes/:disputeId/resolve` */
export const resolveInstallmentDisputeController = async (req, res) => {
  const result = await resolveInstallmentDispute({
    userId: req.userId,
    disputeId: req.params.disputeId,
    action: req.body.action,
    resolutionNote: req.body.resolutionNote,
    partialRefundRub: req.body.partialRefundRub,
  });

  return successRes(res, result);
};
