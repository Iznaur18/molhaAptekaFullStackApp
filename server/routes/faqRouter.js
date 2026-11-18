import { createAsyncRouter } from "../utils/createAsyncRouter.js";

import {
  getFaqItemLinksController,
  patchFaqItemLinkController,
} from "../controllers/faq/faqItemLinkControllers.js";
import { checkAdminMW } from "../middlewares/checkAdminMW.js";
import { checkAuthMW } from "../middlewares/checkAuthMW.js";
import {
  faqItemIdParamValidation,
  patchFaqItemLinkValidation,
} from "../validations/faq/faqItemLinkValidation.js";

const router = createAsyncRouter();

router.get("/item-links", getFaqItemLinksController);
router.patch(
  "/item-links/:itemId",
  checkAuthMW,
  checkAdminMW,
  faqItemIdParamValidation,
  patchFaqItemLinkValidation,
  patchFaqItemLinkController,
);

export default router;
