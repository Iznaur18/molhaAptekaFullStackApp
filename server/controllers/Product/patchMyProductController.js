import { patchMyProduct } from "../../services/product/patchMyProduct.js";
import { successRes } from "../../services/http/index.js";

/** `PATCH /product/:productId` — своего товара или любого (admin), не в открытой продаже. */
export const patchMyProductController = async (req, res) => {
  const product = await patchMyProduct({
    userId: req.userId,
    productId: req.params.productId,
    body: req.body,
  });

  return successRes(res, {
    message: "Товар обновлён",
    product,
  });
};
