import {
  declineShipmentByCourier,
  listOpenDisputes,
  openShipmentDispute,
  resolveShipmentDispute,
} from "../../services/courier/courierDisputes.js";
import {
  sanitizeOrderForBuyerApi,
  sanitizeOrderForCourierApi,
  sanitizeOrderForSellerApi,
} from "../../services/order/buyerPassportShare.js";
import { successRes } from "../../services/http/index.js";

/**
 * Отвечаем по звонящему: код вручения и реквизиты положены только покупателю.
 *
 * @param {import('express').Response} res
 * @param {{ order: any }} result
 * @param {string} requestUserId
 */
const respondToParty = (res, result, requestUserId) => {
  const order = result.order;
  const buyerId = String(order?.userBuyerId?._id ?? order?.userBuyerId ?? "");
  return successRes(res, {
    order:
      buyerId === String(requestUserId)
        ? sanitizeOrderForBuyerApi(order)
        : sanitizeOrderForSellerApi(order),
  });
};

/**
 * `POST /couriers/shipments/:orderId/:sellerId/decline` — курьер снимает с
 * себя заявку, пока товар ещё у продавца.
 */
export const declineShipmentController = async (req, res) => {
  const result = await declineShipmentByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
  });
  return successRes(res, { order: sanitizeOrderForCourierApi(result.order) });
};

/**
 * `POST /couriers/shipments/:orderId/:sellerId/open-dispute` — товар у курьера,
 * а курьер пропал.
 */
export const openShipmentDisputeController = async (req, res) => {
  const result = await openShipmentDispute({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    requestUserId: String(req.userId),
    reason: req.body?.reason ?? "",
  });
  return respondToParty(res, result, String(req.userId));
};

/** `GET /staff/shipment-disputes` — очередь модератора. */
export const getStaffDisputesController = async (req, res) => {
  const result = await listOpenDisputes({ limit: req.query.limit });
  return successRes(res, result);
};

/** `POST /staff/shipment-disputes/:orderId/:sellerId/resolve` */
export const postStaffResolveDisputeController = async (req, res) => {
  const result = await resolveShipmentDispute({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    outcome: req.body.outcome,
    moderatorId: String(req.userId),
  });
  return successRes(res, { order: sanitizeOrderForSellerApi(result.order) });
};
