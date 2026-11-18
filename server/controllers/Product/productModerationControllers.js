import { successRes } from "../../services/http/index.js";
import {
  approveProductModeration,
  countPendingModerationProducts,
  listPendingModerationProducts,
  rejectProductModeration,
} from "../../services/product/productModerationQueue.js";
import { setSellerProductModerationTrust } from "../../services/product/setSellerProductModerationTrust.js";

/** `GET /product/moderation/pending` — очередь на модерацию (FIFO). */
export const getPendingModerationProductsController = async (req, res) => {
  const data = await listPendingModerationProducts({
    page: req.query.page,
    limit: req.query.limit,
  });
  return successRes(res, data);
};

/** `GET /product/moderation/pending/count` */
export const getPendingModerationProductsCountController = async (_req, res) => {
  const data = await countPendingModerationProducts();
  return successRes(res, data);
};

/** `PATCH /product/:productId/moderation/approve` */
export const approveProductModerationController = async (req, res) => {
  const data = await approveProductModeration({
    productId: String(req.params.productId),
    requestId: req.requestId,
  });
  return successRes(res, data);
};

/** `PATCH /product/:productId/moderation/reject` */
export const rejectProductModerationController = async (req, res) => {
  const data = await rejectProductModeration({
    productId: String(req.params.productId),
    productModerationComment: req.body?.productModerationComment,
  });
  return successRes(res, data);
};

/** `PATCH /staff/sellers/:userId/product-moderation-trust` */
export const patchSellerProductModerationTrustController = async (req, res) => {
  const seller = await setSellerProductModerationTrust({
    sellerId: req.params.userId,
    trusted: req.body.trusted === true,
    actorUserId: String(req.userId),
  });

  return successRes(res, { seller });
};
