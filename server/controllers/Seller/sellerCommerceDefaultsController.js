import {
  getSellerCommerceDefaults,
  saveSellerCommerceDefaults,
} from "../../services/seller/sellerCommerceDefaults.js";
import { successRes } from "../../services/http/index.js";

/** `GET /sellers/commerce-defaults/me` — настройки доставки и оплаты продавца. */
export const getMySellerCommerceDefaultsController = async (req, res) => {
  const defaults = await getSellerCommerceDefaults(String(req.userId));
  return successRes(res, { defaults });
};

/**
 * `PUT /sellers/commerce-defaults` — сохранить и разослать по товарам.
 *
 * Ответ несёт `syncedProductCount`: продавцу важно видеть, скольких карточек
 * коснулось сохранение, иначе массовое изменение выглядит как ничего.
 */
export const putMySellerCommerceDefaultsController = async (req, res) => {
  const defaults = await saveSellerCommerceDefaults({
    userId: String(req.userId),
    pickupLocations: req.body.pickupLocations,
    pickupEnabled: req.body.pickupEnabled,
    deliveryCarrier: req.body.deliveryCarrier,
    paymentMethods: req.body.paymentMethods,
    regionCode: req.body.regionCode,
  });
  return successRes(res, { defaults });
};
