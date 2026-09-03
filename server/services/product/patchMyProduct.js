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
import { resetBuyNFreeProgressForProduct } from "./applyBuyNFreeFields.js";
import {
  loadProductWithSellerSnapshot,
  runProductPatchSideEffects,
} from "./runProductPatchSideEffects.js";

const buildOwnerFilter = (productId, userId, isAdmin) =>
  isAdmin ? { _id: productId } : { _id: productId, productSeller: userId };

const hasBodyField = (body, field) =>
  Object.prototype.hasOwnProperty.call(body, field);

/**
 * Замок незакрытых продаж сторожит ровно то, что названо в его сообщении:
 * снятие товара с витрины и включение аукциона (удаление живёт в своём
 * контроллере). Клиент гасит по `hasOpenSales` те же действия.
 *
 * Раньше замок стоял на входе в PATCH и валил любую правку: продавец с одним
 * живым заказом не мог поправить даже опечатку в описании и получал в ответ
 * «Нельзя скрыть или удалить».
 *
 * @param {Record<string, unknown>} body
 * @param {Record<string, unknown>} existing
 */
const patchTouchesOpenSalesLock = (body, existing) => {
  if (hasBodyField(body, "productIsAvailable") && body.productIsAvailable === false) {
    return existing.productIsAvailable !== false;
  }
  if (
    hasBodyField(body, "productStockQuantity") &&
    Number(body.productStockQuantity) === 0
  ) {
    return existing.productIsAvailable !== false;
  }
  if (hasBodyField(body, "productAuctionEnabled")) {
    return (
      Boolean(body.productAuctionEnabled) !== (existing.productAuctionEnabled === true)
    );
  }
  return false;
};

/**
 * @param {{
 *   userId: string;
 *   productId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function patchMyProduct({ userId, productId, body }) {
  const isAdmin = await isUserAdmin(userId);

  const ownerFilter = buildOwnerFilter(productId, userId, isAdmin);
  const existing = await ProductModel.findOne(ownerFilter);
  if (!existing) {
    throw new AppError(404, "Товар не найден или нет прав на изменение");
  }

  if (
    patchTouchesOpenSalesLock(body, existing) &&
    (await hasProductOpenSales(productId))
  ) {
    throw new AppError(409, OPEN_SALES_BLOCK_MESSAGE);
  }

  const {
    $set,
    $unset,
    auctionEnabledChanged,
    nextAuctionEnabled,
    flashSaleNowEnabled,
    shouldResetBuyNFreeProgress,
  } = await buildProductPatchSet({
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

  if (shouldResetBuyNFreeProgress) {
    await resetBuyNFreeProgressForProduct(productId);
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
