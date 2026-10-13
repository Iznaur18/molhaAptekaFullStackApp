import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import { checkAuthMW } from "../middlewares/index.js";
import {
  acceptDealRequestController,
  cancelDealRequestController,
  confirmDealRequestController,
  createDealRequestController,
  declineDealRequestController,
  getDealRequestSellerContactController,
  listMyDealRequestsController,
  setDealRequestOutcomeController,
} from "../controllers/DealRequest/dealRequestControllers.js";
import {
  acceptDealRequestValidation,
  createDealRequestValidation,
  dealRequestIdParamValidation,
  dealRequestOutcomeValidation,
  dealRequestSellerContactValidation,
  declineDealRequestValidation,
  listMyDealRequestsValidation,
} from "../validations/dealRequest/dealRequestValidation.js";

const router = createAsyncRouter();

router.get(
  "/me",
  checkAuthMW,
  listMyDealRequestsValidation,
  listMyDealRequestsController,
);
router.get(
  "/seller-contact/:productId",
  checkAuthMW,
  dealRequestSellerContactValidation,
  getDealRequestSellerContactController,
);
router.post("/", checkAuthMW, createDealRequestValidation, createDealRequestController);
router.post(
  "/:requestId/accept",
  checkAuthMW,
  acceptDealRequestValidation,
  acceptDealRequestController,
);
router.post(
  "/:requestId/decline",
  checkAuthMW,
  declineDealRequestValidation,
  declineDealRequestController,
);
router.post(
  "/:requestId/cancel",
  checkAuthMW,
  dealRequestIdParamValidation,
  cancelDealRequestController,
);
router.post(
  "/:requestId/outcome",
  checkAuthMW,
  dealRequestOutcomeValidation,
  setDealRequestOutcomeController,
);
router.post(
  "/:requestId/confirm",
  checkAuthMW,
  dealRequestIdParamValidation,
  confirmDealRequestController,
);

export default router;
