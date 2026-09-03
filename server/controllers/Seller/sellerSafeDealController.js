import {
  getMySellerSafeDeal,
  listSellerSafeDealApplications,
  reviewSellerSafeDealApplication,
  submitSellerSafeDealApplication,
} from "../../services/seller/sellerSafeDeal.js";
import { successRes } from "../../services/http/index.js";

/** `GET /sellers/safe-deal/me` — статус собственной заявки продавца. */
export const getMySellerSafeDealController = async (req, res) => {
  const safeDeal = await getMySellerSafeDeal(String(req.userId));
  return successRes(res, { safeDeal });
};

/** `POST /sellers/safe-deal/application` — подать или переподать заявку. */
export const submitSellerSafeDealApplicationController = async (req, res) => {
  const safeDeal = await submitSellerSafeDealApplication({
    userId: String(req.userId),
    legalForm: req.body.legalForm,
    inn: req.body.inn,
  });
  return successRes(res, { safeDeal });
};

/** `GET /staff/safe-deal` — очередь модерации. */
export const getStaffSafeDealApplicationsController = async (req, res) => {
  const result = await listSellerSafeDealApplications({
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successRes(res, result);
};

/** `PATCH /staff/safe-deal/:userId/moderation` — решение модератора. */
export const patchStaffSafeDealModerationController = async (req, res) => {
  const safeDeal = await reviewSellerSafeDealApplication({
    userId: req.params.userId,
    moderatorId: String(req.userId),
    nextStatus: req.body.nextStatus,
    comment: req.body.comment,
  });
  return successRes(res, { safeDeal });
};
