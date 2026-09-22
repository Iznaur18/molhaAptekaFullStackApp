import { successRes } from "../../services/http/index.js";
import {
  isYandexDeliveryOfferedBySeller,
  readYandexDeliveryConnectionState,
  removeSellerYandexDeliveryToken,
  saveSellerYandexDeliveryToken,
  setSellerYandexDeliveryEnabled,
  listSellerYandexDropoffPoints,
  setSellerYandexDropoffStation,
} from "../../services/shipping/yandex/yandexDeliverySellerCredentials.js";
import {
  listYandexPointsForBuyer,
  quoteYandexDeliveryShipment,
} from "../../services/shipping/yandex/yandexDeliveryShipment.js";
import {
  createYandexDeliveryRequest,
  getYandexDeliveryLabelPdf,
  refreshYandexDeliveryRequest,
} from "../../services/shipping/yandex/yandexDeliveryRequest.js";
import {
  createYandexExpressClaim,
  quoteYandexExpress,
  readYandexExpressState,
  refreshYandexExpressClaim,
  setSellerYandexExpress,
} from "../../services/shipping/yandex/yandexExpress.js";
import { UserModel } from "../../models/index.js";

/*
 * Как и у СДЭК, адреса живут под /user и /order: новый префикс пришлось бы
 * отдельно прописывать в nginx на проде.
 */

/** GET /user/me/yandex-delivery-credentials — состояние подключения. */
export const getYandexDeliveryCredentialsController = async (req, res) => {
  const seller = await UserModel.findById(req.userId)
    .select("yandexDeliveryIntegration sellerFulfillmentDefaults.pickupLocations")
    .lean();
  return successRes(res, {
    yandexDelivery: {
      ...readYandexDeliveryConnectionState(seller?.yandexDeliveryIntegration),
      express: readYandexExpressState(seller),
    },
  });
};

/** PUT /user/me/yandex-delivery-credentials — сохранить токен (с проверкой). */
export const putYandexDeliveryCredentialsController = async (req, res) => {
  const yandexDelivery = await saveSellerYandexDeliveryToken({
    sellerId: req.userId,
    token: req.body.token,
    environment: req.body.environment,
  });
  return successRes(res, { message: "Яндекс Доставка подключена", yandexDelivery });
};

/** DELETE /user/me/yandex-delivery-credentials — отключить. */
export const deleteYandexDeliveryCredentialsController = async (req, res) => {
  const yandexDelivery = await removeSellerYandexDeliveryToken(req.userId);
  return successRes(res, { message: "Яндекс Доставка отключена", yandexDelivery });
};

/** PATCH /user/me/yandex-delivery-credentials — тумблер. */
export const patchYandexDeliveryCredentialsController = async (req, res) => {
  const yandexDelivery = await setSellerYandexDeliveryEnabled({
    sellerId: req.userId,
    enabled: req.body.enabled === true,
  });
  return successRes(res, {
    message: yandexDelivery.enabled
      ? "Яндекс Доставка включена для покупателей"
      : "Яндекс Доставка выключена для покупателей",
    yandexDelivery,
  });
};

/** GET /order/yandex-delivery-availability — предлагает ли продавец Яндекс Доставку. */
export const getYandexDeliveryAvailabilityController = async (req, res) => {
  const seller = await UserModel.findById(String(req.query.sellerId))
    .select("yandexDeliveryIntegration sellerFulfillmentDefaults.pickupLocations")
    .lean();
  return successRes(res, {
    available: isYandexDeliveryOfferedBySeller(seller?.yandexDeliveryIntegration),
    expressAvailable: readYandexExpressState(seller).ready,
  });
};

/** GET /user/me/yandex-delivery-dropoff-points?city= — куда продавец может сдавать посылки. */
export const getYandexDeliveryDropoffPointsController = async (req, res) => {
  const result = await listSellerYandexDropoffPoints({
    sellerId: req.userId,
    city: String(req.query.city),
  });
  return successRes(res, result);
};

/** PUT /user/me/yandex-delivery-dropoff — запомнить пункт сдачи. */
export const putYandexDeliveryDropoffController = async (req, res) => {
  const yandexDelivery = await setSellerYandexDropoffStation({
    sellerId: req.userId,
    stationId: req.body.stationId,
  });
  return successRes(res, { message: "Пункт сдачи сохранён", yandexDelivery });
};

/** GET /order/yandex-delivery-points?sellerId=&city= — пункты выдачи для покупателя. */
export const getYandexDeliveryPointsController = async (req, res) => {
  const result = await listYandexPointsForBuyer({
    sellerId: String(req.query.sellerId),
    city: String(req.query.city),
  });
  return successRes(res, result);
};

/** POST /order/yandex-delivery-quote — цена и срок до выбранного пункта. */
export const postYandexDeliveryQuoteController = async (req, res) => {
  const result = await quoteYandexDeliveryShipment({
    items: req.body.items,
    pickupPointId: req.body.pickupPointId,
  });
  return successRes(res, result);
};

/** POST /order/:orderId/yandex-delivery-request — продавец создаёт заявку. */
export const postYandexDeliveryRequestController = async (req, res) => {
  const request = await createYandexDeliveryRequest({
    orderId: String(req.params.orderId),
    sellerId: String(req.userId),
  });
  return successRes(res, { request });
};

/** GET /order/:orderId/yandex-delivery-request — обновить статус заявки. */
export const getYandexDeliveryRequestController = async (req, res) => {
  const request = await refreshYandexDeliveryRequest({
    orderId: String(req.params.orderId),
    sellerId: String(req.userId),
  });
  return successRes(res, { request });
};

/** GET /order/:orderId/yandex-delivery-label — ярлык на коробку (PDF). */
export const getYandexDeliveryLabelController = async (req, res) => {
  const { pdf, fileName } = await getYandexDeliveryLabelPdf({
    orderId: String(req.params.orderId),
    sellerId: String(req.userId),
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Cache-Control", "no-store");
  return res.send(pdf);
};

/** PATCH /user/me/yandex-express — продавец включает «Экспресс» и телефон для курьера. */
export const patchYandexExpressController = async (req, res) => {
  const express = await setSellerYandexExpress({
    sellerId: req.userId,
    enabled: req.body.enabled === true,
    phone: req.body.phone,
  });
  return successRes(res, { express });
};

/** POST /order/yandex-express-quote — цена и время курьера до адреса покупателя. */
export const postYandexExpressQuoteController = async (req, res) => {
  const result = await quoteYandexExpress({
    items: req.body.items,
    toLat: req.body.toLat,
    toLon: req.body.toLon,
  });
  return successRes(res, result);
};

/** POST /order/:orderId/yandex-express-claim — продавец вызывает курьера. */
export const postYandexExpressClaimController = async (req, res) => {
  const claim = await createYandexExpressClaim({
    orderId: String(req.params.orderId),
    sellerId: String(req.userId),
  });
  return successRes(res, { claim });
};

/** GET /order/:orderId/yandex-express-claim — статус, код передачи, ссылка. */
export const getYandexExpressClaimController = async (req, res) => {
  const claim = await refreshYandexExpressClaim({
    orderId: String(req.params.orderId),
    sellerId: String(req.userId),
  });
  return successRes(res, { claim });
};
