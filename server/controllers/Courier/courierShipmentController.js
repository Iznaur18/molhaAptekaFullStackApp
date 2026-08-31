import {
  acceptShipmentByCourier,
  completeDeliveryByCourier,
  confirmHandoverByCourier,
  issueHandoverCode,
  markArrivedByCourier,
  startDeliveryByCourier,
} from "../../services/courier/courierShipmentFlow.js";
import { sanitizeOrderForBuyerApi } from "../../services/order/buyerPassportShare.js";
import { successRes } from "../../services/http/index.js";

/** Курьеру и продавцу паспортные данные покупателя не показываем. */
const respondWithOrder = (res, result) =>
  successRes(res, { order: sanitizeOrderForBuyerApi(result.order) });

/** `POST /couriers/shipments/:orderId/:sellerId/accept` */
export const acceptShipmentController = async (req, res) => {
  const result = await acceptShipmentByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
  });
  return respondWithOrder(res, result);
};

/**
 * `POST /couriers/shipments/:orderId/:sellerId/handover-code` — продавец
 * выдаёт код и показывает его курьеру вживую.
 */
export const issueHandoverCodeController = async (req, res) => {
  const result = await issueHandoverCode({
    orderId: req.params.orderId,
    sellerId: String(req.userId),
  });
  return successRes(res, { code: result.code });
};

/** `POST /couriers/shipments/:orderId/:sellerId/handover` */
export const confirmHandoverController = async (req, res) => {
  const result = await confirmHandoverByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
    code: req.body.code,
  });
  return respondWithOrder(res, result);
};

/** `POST /couriers/shipments/:orderId/:sellerId/start-delivery` */
export const startDeliveryController = async (req, res) => {
  const result = await startDeliveryByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
  });
  return respondWithOrder(res, result);
};

/** `POST /couriers/shipments/:orderId/:sellerId/arrived` */
export const markArrivedController = async (req, res) => {
  const result = await markArrivedByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
  });
  return respondWithOrder(res, result);
};

/** `POST /couriers/shipments/:orderId/:sellerId/complete` */
export const completeDeliveryController = async (req, res) => {
  const result = await completeDeliveryByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
    code: req.body.code,
  });
  return respondWithOrder(res, result);
};
