import { AppError } from "../../errors/AppError.js";
import { ProductModel } from "../../models/index.js";
import { isUserAdmin } from "../access/adminUserGuard.js";
import { deleteProductsCascade } from "./deleteProductsCascade.js";
import { hasProductOpenSales, OPEN_SALES_BLOCK_MESSAGE } from "./productOrderLocks.js";

/**
 * Удаление своего товара (любой статус модерации) или любого (admin).
 *
 * @param {{ actorUserId: string; productId: string }} args
 */
export async function deleteMyProduct({ actorUserId, productId }) {
  const isAdmin = await isUserAdmin(actorUserId);

  if (await hasProductOpenSales(productId)) {
    throw new AppError(409, OPEN_SALES_BLOCK_MESSAGE);
  }

  const ownerFilter = isAdmin
    ? { _id: productId }
    : {
        _id: productId,
        productSeller: actorUserId,
      };

  const product = await ProductModel.findOne(ownerFilter)
    .select("_id productPreviewVideoUrl")
    .lean();

  if (!product) {
    throw new AppError(404, "Товар не найден или нет прав на удаление");
  }

  const { deletedIds, blockedIds } = await deleteProductsCascade([product]);

  if (blockedIds.length > 0 && deletedIds.length === 0) {
    throw new AppError(409, OPEN_SALES_BLOCK_MESSAGE);
  }
  if (deletedIds.length === 0) {
    throw new AppError(404, "Товар не найден или нет прав на удаление");
  }

  return { message: "Товар удалён" };
}
