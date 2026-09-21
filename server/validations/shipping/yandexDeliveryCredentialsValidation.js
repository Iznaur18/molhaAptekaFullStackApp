import {
  yandexDeliveryCredentialsBodySchema,
  yandexDeliveryToggleBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const yandexDeliveryCredentialsValidation = [
  validateBodyZod(yandexDeliveryCredentialsBodySchema),
];

export const yandexDeliveryToggleValidation = [
  validateBodyZod(yandexDeliveryToggleBodySchema),
];
