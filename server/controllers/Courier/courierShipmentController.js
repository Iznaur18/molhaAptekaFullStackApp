import {
  acceptShipmentByCourier,
  completeDeliveryByCourier,
  confirmHandoverByCourier,
  issueHandoverCode,
  markArrivedByCourier,
  startDeliveryByCourier,
} from "../../services/courier/courierShipmentFlow.js";
import {
  listCourierOverview,
  listMyCourierDeliveries,
} from "../../services/courier/courierOverview.js";
import { raiseShipmentDeliveryFee } from "../../services/courier/courierDeliveryFee.js";
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

/** `GET /couriers/overview` — свободные отправления в регионе курьера. */
export const getCourierOverviewController = async (req, res) => {
  const result = await listCourierOverview({
    courierId: String(req.userId),
    lat: req.query.lat ?? null,
    lon: req.query.lon ?? null,
    limit: req.query.limit,
  });
  return successRes(res, result);
};

/** `PATCH /order/:orderId/shipment/:sellerId/delivery-fee` — покупатель поднимает сумму. */
export const raiseDeliveryFeeController = async (req, res) => {
  const result = await raiseShipmentDeliveryFee({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    buyerId: String(req.userId),
    feeRub: req.body.deliveryFeeRub,
  });
  return successRes(res, {
    deliveryFeeRub: result.deliveryFeeRub,
    order: sanitizeOrderForBuyerApi(result.order),
  });
};

/** `GET /couriers/my-deliveries` — активные доставки курьера. */
export const getMyCourierDeliveriesController = async (req, res) => {
  const result = await listMyCourierDeliveries({ courierId: String(req.userId) });
  return successRes(res, result);
};
