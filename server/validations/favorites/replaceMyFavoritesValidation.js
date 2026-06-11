import { replaceFavoritesBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const replaceMyFavoritesValidation = [
  validateBodyZod(replaceFavoritesBodySchema),
];
