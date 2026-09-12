import { sellerDeliveryQuoteBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateRuDeliveryAddress } from "../../middlewares/validateRuDeliveryAddress.js";

/**
 * Та же проверка адреса, что и у `POST /order`: котировка обязана увидеть
 * адрес ровно так, как его увидит заказ, иначе суммы разойдутся.
 */
export const sellerDeliveryQuoteValidation = [
  validateBodyZod(sellerDeliveryQuoteBodySchema),
  validateRuDeliveryAddress({
    lineField: "deliveryAddress",
    flatField: "deliveryAddressFlat",
    lineRequired: true,
  }),
];
