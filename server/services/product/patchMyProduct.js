import { ProductModel } from "../../models/index.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import { AppError } from "../../errors/AppError.js";
import { isUserAdmin } from "../access/adminUserGuard.js";
import {
  hasProductOpenSales,
  OPEN_SALES_BLOCK_MESSAGE,
} from "./productOrderLocks.js";
import { applyProductSearchBlobToSet } from "./applyProductSearchBlobToProductWrite.js";

import { buildProductPatchSet } from "./buildProductPatchSet.js";
import {
  loadProductWithSellerSnapshot,
  runProductPatchSideEffects,
} from "./runProductPatchSideEffects.js";

const buildOwnerFilter = (productId, userId, isAdmin) =>
  isAdmin ? { _id: productId } : { _id: productId, productSeller: userId };

/**
 * @param {{
 *   userId: string;
 *   productId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function patchMyProduct({ userId, productId, body }) {
  const isAdmin = await isUserAdmin(userId);

  if (await hasProductOpenSales(productId)) {
    throw new AppError(409, OPEN_SALES_BLOCK_MESSAGE);
  }

  const ownerFilter = buildOwnerFilter(productId, userId, isAdmin);
  const existing = await ProductModel.findOne(ownerFilter);
  if (!existing) {
    throw new AppError(404, "Товар не найден или нет прав на изменение");
  }

  const { $set, auctionEnabledChanged, nextAuctionEnabled } =
    await buildProductPatchSet({
      existing,
      body,
      isAdmin,
      productId,
    });

  applyProductSearchBlobToSet($set, existing);

  const product = await ProductModel.findOneAndUpdate(
    ownerFilter,
    { $set },
    { returnDocument: "after", runValidators: true },
  )
    .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
    .lean();

  if (!product) {
    throw new AppError(404, "Товар не найден или нет прав на изменение");
  }

  await runProductPatchSideEffects({
    userId,
    productId,
    product,
    $set,
    isAdmin,
    auctionEnabledChanged,
    nextAuctionEnabled,
  });

  return loadProductWithSellerSnapshot(productId);
}
