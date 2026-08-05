import { addressGeolocateBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const addressGeolocateValidation = [
  validateBodyZod(addressGeolocateBodySchema),
];
