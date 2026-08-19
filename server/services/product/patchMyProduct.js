import { ProductModel } from "../../models/index.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import { isUserAdmin } from "../access/adminUserGuard.js";
import { hasProductOpenSales, OPEN_SALES_BLOCK_MESSAGE } from "./productOrderLocks.js";
import { applyProductSearchBlobToSet } from "./applyProductSearchBlobToProductWrite.js";
import {
  computeProductDiscountPercent,
  notifyFollowersOfSellerProductDiscount,
} from "./productDiscount.js";

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

  const { $set, $unset, auctionEnabledChanged, nextAuctionEnabled, flashSaleNowEnabled } =
    await buildProductPatchSet({
      existing,
      body,
      isAdmin,
      productId,
    });

  applyProductSearchBlobToSet($set, existing);

  const update = {};
  if (Object.keys($set).length > 0) {
    update.$set = $set;
  }
  if (Object.keys($unset).length > 0) {
    update.$unset = $unset;
  }

  const product = await ProductModel.findOneAndUpdate(
    ownerFilter,
    update,
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

  if (flashSaleNowEnabled && product.productModerationStatus === PRODUCT_MODERATION_APPROVED) {
    const previousPercent =
      existing.productFlashSaleEnabled === true
        ? computeProductDiscountPercent(
            existing.productFlashSaleBasePrice,
            existing.productPrice,
          )
        : computeProductDiscountPercent(existing.productOldPrice, existing.productPrice);
    try {
      await notifyFollowersOfSellerProductDiscount(product, previousPercent);
    } catch {
      /* не блокируем patch */
    }
  }

  return loadProductWithSellerSnapshot(productId);
}
