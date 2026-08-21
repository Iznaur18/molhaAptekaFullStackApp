import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import { checkAuthMW } from "../middlewares/index.js";
import {
  createSellerShelfController,
  deleteSellerShelfController,
  listMySellerShelvesController,
  listPublicSellerShelvesController,
  patchSellerShelfController,
  reorderSellerShelvesController,
  setSellerShelfProductsController,
} from "../controllers/SellerShelf/sellerShelfControllers.js";
import {
  createSellerShelfValidation,
  patchSellerShelfValidation,
  reorderSellerShelvesValidation,
  sellerShelfIdParamValidation,
  sellerShelfSellerIdParamValidation,
  setSellerShelfProductsValidation,
} from "../validations/sellerShelf/sellerShelfValidation.js";

const router = createAsyncRouter();

router.get("/me", checkAuthMW, listMySellerShelvesController);
router.post("/me/reorder", checkAuthMW, reorderSellerShelvesValidation, reorderSellerShelvesController);
router.post("/", checkAuthMW, createSellerShelfValidation, createSellerShelfController);
router.patch(
  "/:shelfId",
  checkAuthMW,
  patchSellerShelfValidation,
  patchSellerShelfController,
);
router.delete(
  "/:shelfId",
  checkAuthMW,
  sellerShelfIdParamValidation,
  deleteSellerShelfController,
);
router.put(
  "/:shelfId/products",
  checkAuthMW,
  setSellerShelfProductsValidation,
  setSellerShelfProductsController,
);
router.get(
  "/seller/:sellerId",
  sellerShelfSellerIdParamValidation,
  listPublicSellerShelvesController,
);

export default router;
