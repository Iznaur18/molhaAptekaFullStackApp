import { createOrderBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { ruDeliveryAddressBodyValidation } from "../address/ruDeliveryAddressValidation.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

/** Zod-структура + DaData-проверка адреса. */
export const makeOrderValidationZod = [
  validateBodyZod(createOrderBodySchema),
  ...ruDeliveryAddressBodyValidation({
    lineField: "deliveryAddress",
    flatField: "deliveryAddressFlat",
    lineRequired: true,
  }),
  handleValidationByExpressErrors,
];
