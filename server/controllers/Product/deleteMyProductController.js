import { successRes } from "../../services/http/index.js";
import { deleteMyProduct } from "../../services/product/deleteMyProduct.js";

/** Удаление своего товара (любой статус модерации) или любого (admin). DELETE /product/:productId */
export const deleteMyProductController = async (req, res) => {
  const data = await deleteMyProduct({
    actorUserId: String(req.userId),
    productId: String(req.params.productId),
  });
  return successRes(res, data);
};
