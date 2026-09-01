import {
  acceptShipmentByCourier,
  completeDeliveryByCourier,
  confirmHandoverByCourier,
  issueHandoverCode,
  markArrivedByCourier,
  startDeliveryByCourier,
  setShipmentPaymentConfirmed,
} from "../../services/courier/courierShipmentFlow.js";
import {
  listCourierOverview,
  listMyCourierDeliveries,
} from "../../services/courier/courierOverview.js";
import { raiseShipmentDeliveryFee } from "../../services/courier/courierDeliveryFee.js";
import { replaceShipmentCourier } from "../../services/courier/replaceShipmentCourier.js";
import {
  sanitizeOrderForBuyerApi,
  sanitizeOrderForCourierApi,
  sanitizeOrderForSellerApi,
} from "../../services/order/buyerPassportShare.js";
import { successRes } from "../../services/http/index.js";

/** Шаги курьера: ни кодов, ни реквизитов, ни паспорта. */
const respondToCourier = (res, result) =>
  successRes(res, { order: sanitizeOrderForCourierApi(result.order) });

/**
 * Ручку дёргают обе стороны сделки, и покупателю положено видеть свой код
 * вручения и реквизиты для перевода, а продавцу — нет.
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

/** `POST /couriers/shipments/:orderId/:sellerId/accept` */
export const acceptShipmentController = async (req, res) => {
  const result = await acceptShipmentByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
  });
  return respondToCourier(res, result);
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
  return respondToCourier(res, result);
};

/** `POST /couriers/shipments/:orderId/:sellerId/start-delivery` */
export const startDeliveryController = async (req, res) => {
  const result = await startDeliveryByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
  });
  return respondToCourier(res, result);
};

/** `POST /couriers/shipments/:orderId/:sellerId/arrived` */
export const markArrivedController = async (req, res) => {
  const result = await markArrivedByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
  });
  return respondToCourier(res, result);
};

/** `POST /couriers/shipments/:orderId/:sellerId/complete` */
export const completeDeliveryController = async (req, res) => {
  const result = await completeDeliveryByCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    courierId: String(req.userId),
    code: req.body.code,
  });
  return respondToCourier(res, result);
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

/**
 * `POST /couriers/shipments/:orderId/:sellerId/replace-courier` — продавец или
 * покупатель отказывается от назначенного курьера.
 */
export const replaceShipmentCourierController = async (req, res) => {
  const result = await replaceShipmentCourier({
    orderId: req.params.orderId,
    sellerId: req.params.sellerId,
    requestUserId: String(req.userId),
  });
  return respondToParty(res, result, String(req.userId));
};

/**
 * `POST /couriers/shipments/:orderId/:sellerId/payment-confirmed` — продавец
 * подтверждает, что перевод дошёл (или откатывает подтверждение).
 */
export const setShipmentPaymentConfirmedController = async (req, res) => {
  const result = await setShipmentPaymentConfirmed({
    orderId: req.params.orderId,
    // Подтверждает только продавец — свой id берём из сессии.
    sellerId: String(req.userId),
    confirmed: req.body.confirmed !== false,
  });
  return successRes(res, { order: sanitizeOrderForSellerApi(result.order) });
};
