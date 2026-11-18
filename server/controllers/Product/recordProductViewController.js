import { successRes } from "../../services/http/index.js";
import { recordProductView } from "../../services/product/recordProductView.js";

/** `POST /product/:productId/view` — уникальный просмотр (Bearer, не продавец товара). */
export const recordProductViewController = async (req, res) => {
  const data = await recordProductView({
    productId: String(req.params.productId),
    viewerUserId: String(req.userId),
  });
  return successRes(res, data);
};
