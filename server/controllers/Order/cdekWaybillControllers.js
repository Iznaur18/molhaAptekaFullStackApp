import { successRes } from "../../services/http/index.js";
import {
  createCdekWaybill,
  refreshCdekWaybill,
} from "../../services/shipping/cdek/cdekWaybill.js";
import {
  listCdekDeliveryPoints,
  resolveCdekCityCode,
} from "../../services/shipping/cdek/cdekDeliveryPoints.js";
import { resolveSellerCdekCredentials } from "../../services/shipping/cdek/cdekSellerCredentials.js";
import { getCdekLabelPdf } from "../../services/shipping/cdek/cdekLabel.js";
import { createCdekIntake } from "../../services/shipping/cdek/cdekIntake.js";

/** `POST /order/:orderId/cdek-waybill` — продавец создаёт накладную СДЭК. */
export const postCdekWaybillController = async (req, res) => {
  const waybill = await createCdekWaybill({
    orderId: String(req.params.orderId),
    sellerId: String(req.userId),
    shipmentPointCode: req.body?.shipmentPointCode ?? null,
  });
  return successRes(res, { waybill });
};

/** `GET /order/:orderId/cdek-waybill` — обновить статус и трек-номер. */
export const getCdekWaybillController = async (req, res) => {
  const waybill = await refreshCdekWaybill({
    orderId: String(req.params.orderId),
    sellerId: String(req.userId),
  });
  return successRes(res, { waybill });
};

/**
 * `GET /order/cdek-reception-points?city=` — куда продавец может сдать
 * посылку. Ключом самого продавца: у каждого свой договор.
 */
export const getCdekReceptionPointsController = async (req, res) => {
  const credentials = await resolveSellerCdekCredentials(String(req.userId));
  const cityCode = await resolveCdekCityCode(credentials, {
    city: req.query.city ? String(req.query.city) : null,
  });
  if (!cityCode) {
    return successRes(res, { points: [], cityCode: null });
  }
  const points = await listCdekDeliveryPoints(credentials, {
    cityCode,
    purpose: "reception",
  });
  return successRes(res, { points, cityCode });
};

/** `GET /order/:orderId/cdek-label` — PDF этикетки для коробки. */
export const getCdekLabelController = async (req, res) => {
  const { pdf, fileName } = await getCdekLabelPdf({
    orderId: String(req.params.orderId),
    sellerId: String(req.userId),
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Cache-Control", "no-store");
  return res.send(pdf);
};

/** `POST /order/:orderId/cdek-intake` — вызвать курьера СДЭК к продавцу. */
export const postCdekIntakeController = async (req, res) => {
  const waybill = await createCdekIntake({
    orderId: String(req.params.orderId),
    sellerId: String(req.userId),
    intakeDate: req.body.intakeDate,
    timeFrom: req.body.timeFrom,
    timeTo: req.body.timeTo,
    phone: req.body.phone,
    comment: req.body.comment ?? "",
  });
  return successRes(res, { waybill });
};
