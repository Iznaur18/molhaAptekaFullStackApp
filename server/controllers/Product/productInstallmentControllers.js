import {
  approveInstallmentModeration,
  countPendingInstallmentModeration,
  getPendingInstallmentModeration,
  getProductInstallmentProgram,
  rejectInstallmentModeration,
  upsertProductInstallmentProgram,
} from "../../services/product/productInstallment.js";
import { successRes } from "../../services/http/index.js";

/** `GET /product/:productId/installment-program` */
export const getProductInstallmentProgramController = async (req, res) => {
  const result = await getProductInstallmentProgram({
    productId: req.params.productId,
    userId: req.userId,
  });

  return successRes(res, result);
};

/** `PUT /product/:productId/installment-program` */
export const upsertProductInstallmentProgramController = async (req, res) => {
  const result = await upsertProductInstallmentProgram({
    userId: req.userId,
    productId: req.params.productId,
    body: req.body,
  });

  return successRes(res, result);
};

/** `GET /product/installment/moderation/pending` */
export const getPendingInstallmentModerationController = async (req, res) => {
  const result = await getPendingInstallmentModeration({ query: req.query });
  return successRes(res, result);
};

/** `GET /product/installment/moderation/pending/count` */
export const getPendingInstallmentModerationCountController = async (req, res) => {
  const result = await countPendingInstallmentModeration();
  return successRes(res, result);
};

/** `PATCH /product/:productId/installment/moderation/approve` */
export const approveInstallmentModerationController = async (req, res) => {
  const result = await approveInstallmentModeration({
    productId: req.params.productId,
    staffId: req.userId,
  });

  return successRes(res, result);
};

/** `PATCH /product/:productId/installment/moderation/reject` */
export const rejectInstallmentModerationController = async (req, res) => {
  const result = await rejectInstallmentModeration({
    productId: req.params.productId,
    staffId: req.userId,
    moderationComment: req.body?.moderationComment,
  });

  return successRes(res, result);
};
