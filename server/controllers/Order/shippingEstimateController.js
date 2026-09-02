import { estimateShipmentDelivery } from "../../services/shipping/estimateShipmentDelivery.js";
import { successRes } from "../../services/http/index.js";

/**
 * `POST /order/shipping-estimate` — сколько попросит служба за доставку.
 *
 * Живёт внутри `/order` намеренно: новый префикс потребовал бы правки nginx
 * на сервере, и раздел уехал бы на прод мёртвым, как это уже было с
 * «Стать курьером».
 */
export const postShippingEstimateController = async (req, res) => {
  const result = await estimateShipmentDelivery({
    productIds: Array.isArray(req.body?.productIds) ? req.body.productIds : [],
    deliveryLat: Number(req.body?.deliveryLat),
    deliveryLon: Number(req.body?.deliveryLon),
  });
  return successRes(res, result);
};
