import { successRes } from "../../services/http/index.js";
import { quoteSellerDelivery } from "../../services/order/quoteSellerDelivery.js";

/**
 * `POST /order/seller-delivery-quote` — тариф продавца и расстояние по дорогам
 * до оформления: покупатель видит в корзине ту сумму, которую заплатит.
 */
export const postSellerDeliveryQuoteController = async (req, res) => {
  const result = await quoteSellerDelivery({
    productIds: req.body.productIds,
    verifiedDeliveryAddress: req.verifiedDeliveryAddress,
    deliveryAddressGeo: req.body.deliveryAddressGeo ?? null,
  });
  return successRes(res, result);
};
