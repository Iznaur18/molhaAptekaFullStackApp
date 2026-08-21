import { getBuyNFreeProgressForBuyer } from "../../services/product/productBuyNFreeProgress.js";
import { successRes } from "../../services/http/index.js";

/** GET /product/:productId/buy-n-free/me */
export const getMyProductBuyNFreeProgressController = async (req, res) => {
  const result = await getBuyNFreeProgressForBuyer({
    buyerId: req.userId,
    productId: req.params.productId,
  });
  return successRes(res, result);
};
