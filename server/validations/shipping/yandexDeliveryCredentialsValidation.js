import {
  yandexDeliveryCityQuerySchema,
  yandexDeliveryCredentialsBodySchema,
  yandexDeliveryDropoffBodySchema,
  yandexDeliveryPointsQuerySchema,
  yandexDeliveryQuoteBodySchema,
  yandexDeliveryToggleBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const yandexDeliveryCredentialsValidation = [
  validateBodyZod(yandexDeliveryCredentialsBodySchema),
];

export const yandexDeliveryToggleValidation = [
  validateBodyZod(yandexDeliveryToggleBodySchema),
];

export const yandexDeliveryDropoffPointsValidation = [
  validateQueryZod(yandexDeliveryCityQuerySchema),
];

export const yandexDeliveryDropoffValidation = [
  validateBodyZod(yandexDeliveryDropoffBodySchema),
];

export const yandexDeliveryPointsValidation = [
  validateQueryZod(yandexDeliveryPointsQuerySchema),
];

export const yandexDeliveryQuoteValidation = [
  validateBodyZod(yandexDeliveryQuoteBodySchema),
];
