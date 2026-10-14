import {
  acceptDealRequest,
  cancelDealRequest,
  confirmDealRequest,
  createDealRequest,
  declineDealRequest,
  getDealRequestSellerContact,
  listMyDealRequests,
  setDealRequestOutcome,
} from "../../services/deal-request/dealRequest.js";
import { successRes } from "../../services/http/index.js";

/** `POST /deal-requests` — заявка на осмотр или услугу. */
export const createDealRequestController = async (req, res) => {
  const data = await createDealRequest({
    userId: String(req.userId),
    productId: req.body.productId,
    preferredAt: req.body.preferredAt,
    comment: req.body.comment,
    address: req.body.address,
  });
  return successRes(res, data, 201);
};

/** `GET /deal-requests/me?role=buyer|seller` */
export const listMyDealRequestsController = async (req, res) => {
  const data = await listMyDealRequests({
    userId: String(req.userId),
    role: req.query.role,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successRes(res, data);
};

/** `POST /deal-requests/:requestId/accept` */
export const acceptDealRequestController = async (req, res) => {
  const data = await acceptDealRequest({
    userId: String(req.userId),
    requestId: String(req.params.requestId),
    agreedAt: req.body.agreedAt,
    quotedPriceRub: req.body.quotedPriceRub,
  });
  return successRes(res, data);
};

/** `POST /deal-requests/:requestId/decline` */
export const declineDealRequestController = async (req, res) => {
  const data = await declineDealRequest({
    userId: String(req.userId),
    requestId: String(req.params.requestId),
    reason: req.body.reason,
  });
  return successRes(res, data);
};

/** `POST /deal-requests/:requestId/cancel` */
export const cancelDealRequestController = async (req, res) => {
  const data = await cancelDealRequest({
    userId: String(req.userId),
    requestId: String(req.params.requestId),
  });
  return successRes(res, data);
};

/** `POST /deal-requests/:requestId/outcome` — итог встречи от продавца. */
export const setDealRequestOutcomeController = async (req, res) => {
  const data = await setDealRequestOutcome({
    userId: String(req.userId),
    requestId: String(req.params.requestId),
    outcome: req.body.outcome,
  });
  return successRes(res, data);
};

/** `POST /deal-requests/:requestId/confirm` — клиент подтверждает услугу. */
export const confirmDealRequestController = async (req, res) => {
  const data = await confirmDealRequest({
    userId: String(req.userId),
    requestId: String(req.params.requestId),
  });
  return successRes(res, data);
};

/** `GET /deal-requests/seller-contact/:productId` — «Показать телефон». */
export const getDealRequestSellerContactController = async (req, res) => {
  const data = await getDealRequestSellerContact({
    userId: String(req.userId),
    productId: String(req.params.productId),
  });
  return successRes(res, data);
};
