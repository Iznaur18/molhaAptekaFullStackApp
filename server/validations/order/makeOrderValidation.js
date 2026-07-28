import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  PRODUCT_DELIVERY_NOT_AVAILABLE_MESSAGE,
  createOrderBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateRuDeliveryAddress } from "../../middlewares/validateRuDeliveryAddress.js";
import { errorRes } from "../../services/http/index.js";

const assertFulfillmentAllowed = (req, res, next) => {
  const method = req.body?.fulfillmentMethod ?? ORDER_FULFILLMENT_PICKUP;
  if (method === ORDER_FULFILLMENT_DELIVERY && !PRODUCT_DELIVERY_FULFILLMENT_ENABLED) {
    return errorRes(res, 400, PRODUCT_DELIVERY_NOT_AVAILABLE_MESSAGE);
  }
  return next();
};

const validateDeliveryAddressWhenNeeded = (req, res, next) => {
  const method = req.body?.fulfillmentMethod ?? ORDER_FULFILLMENT_PICKUP;
  if (method !== ORDER_FULFILLMENT_DELIVERY) {
    return next();
  }
  return validateRuDeliveryAddress({
    lineField: "deliveryAddress",
    flatField: "deliveryAddressFlat",
    lineRequired: true,
  })(req, res, next);
};

export const makeOrderValidation = [
  validateBodyZod(createOrderBodySchema),
  assertFulfillmentAllowed,
  validateDeliveryAddressWhenNeeded,
];
