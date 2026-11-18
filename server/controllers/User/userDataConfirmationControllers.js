import { successRes } from "../../services/http/index.js";
import {
  countPendingDataConfirmationRequests,
  getMyDataConfirmationRequest,
  getPendingDataConfirmationRequests,
  resolveDataConfirmationRequest,
  submitDataConfirmationRequest,
} from "../../services/user/userDataConfirmationHelpers.js";

/**
 * `POST /user/me/data-confirmation-request`
 */
export const submitDataConfirmationRequestController = async (req, res) => {
  const data = await submitDataConfirmationRequest({
    userId: String(req.userId),
    passportRaw: req.body?.passport ?? req.body,
    passportSelfiePhotoUrlRaw: req.body?.passportSelfiePhotoUrl,
  });
  return successRes(res, data);
};

/**
 * `GET /user/me/data-confirmation-request`
 */
export const getMyDataConfirmationRequestController = async (req, res) => {
  const data = await getMyDataConfirmationRequest({
    userId: String(req.userId),
  });
  return successRes(res, data);
};

/**
 * `GET /user/data-confirmation-requests/pending`
 */
export const getPendingDataConfirmationRequestsController = async (_req, res) => {
  const data = await getPendingDataConfirmationRequests();
  return successRes(res, data);
};

/**
 * `GET /user/data-confirmation-requests/pending/count`
 */
export const getPendingDataConfirmationRequestsCountController = async (
  _req,
  res,
) => {
  const data = await countPendingDataConfirmationRequests();
  return successRes(res, data);
};

/**
 * `PATCH /user/data-confirmation-requests/:requestId/resolve`
 */
export const resolveDataConfirmationRequestController = async (req, res) => {
  const data = await resolveDataConfirmationRequest({
    requestId: String(req.params.requestId),
    staffUserId: String(req.userId),
    resolution: String(req.body?.resolution ?? "").trim(),
    staffNote: String(req.body?.staffNote ?? "").trim(),
  });
  return successRes(res, data);
};
