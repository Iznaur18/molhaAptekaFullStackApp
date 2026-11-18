import { successRes } from "../../services/http/index.js";
import { getCatalogProductByIdForViewer } from "../../services/product/getCatalogProductById.js";

/**
 * `GET /product/:productId/catalog` — карточка товара как в каталоге.
 */
export const getCatalogProductByIdController = async (req, res) => {
  const data = await getCatalogProductByIdForViewer({
    productId: String(req.params.productId),
    viewerUserId: req.userId ? String(req.userId) : null,
  });
  return successRes(res, data);
};
