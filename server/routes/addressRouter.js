import { Router } from "express";

import { addressSuggestController } from "../controllers/Address/addressSuggestController.js";
import { addressSuggestValidation } from "../validations/address/addressSuggestValidation.js";

const router = Router();

router.post("/suggest", addressSuggestValidation, addressSuggestController);

export { router as addressRouter };
