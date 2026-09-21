import { UserModel } from "../../models/index.js";
import { successRes } from "../../services/http/index.js";
import {
  listCdekPointsForBuyer,
  quoteCdekShipment,
} from "../../services/shipping/cdek/quoteCdekShipment.js";

/*
 * Оба адреса живут внутри /order по той же причине, что и /order/shipping-estimate:
 * новый префикс пришлось бы отдельно прописывать в nginx на проде.
 */

/** `POST /order/cdek-quote` — сколько попросит СДЭК за доставку до пункта. */
export const postCdekQuoteController = async (req, res) => {
  const result = await quoteCdekShipment({
    productIds: Array.isArray(req.body?.productIds) ? req.body.productIds : [],
    toCityCode: req.body?.toCityCode ?? null,
    toPostalCode: req.body?.toPostalCode ?? null,
    toAddress: req.body?.toAddress ?? null,
  });
  return successRes(res, result);
};

/**
 * `GET /order/cdek-availability` — подключил ли продавец СДЭК.
 *
 * Корзина спрашивает до всякого расчёта: без этого кнопку «СДЭК» пришлось бы
 * показывать всем и тратить запросы в службу на продавцов без договора.
 */
export const getCdekAvailabilityController = async (req, res) => {
  const seller = await UserModel.findById(String(req.query.sellerId))
    .select("cdekIntegration.account cdekIntegration.secureSealed")
    .lean();
  const available = Boolean(
    seller?.cdekIntegration?.account && seller?.cdekIntegration?.secureSealed,
  );
  return successRes(res, { available });
};

/** `GET /order/cdek-delivery-points` — пункты выдачи в городе покупателя. */
export const getCdekDeliveryPointsController = async (req, res) => {
  const result = await listCdekPointsForBuyer({
    sellerId: String(req.query.sellerId),
    cityCode: req.query.cityCode ? Number(req.query.cityCode) : null,
    postalCode: req.query.postalCode ? String(req.query.postalCode) : null,
    city: req.query.city ? String(req.query.city) : null,
  });
  return successRes(res, result);
};
