import mongoose from "mongoose";

import { normalizeStoredCartItems } from "../controllers/Cart/cartItemHelpers.js";
import { CartModel, ProductModel, ProductViewModel } from "../models/index.js";
import { getProductIdsWithOpenSales } from "./productOrderLocks.js";

export const USER_DELETE_OPEN_SALES_MESSAGE =
  "Нельзя удалить пользователя: есть незавершённые продажи по его товарам";

/**
 * @param {string[]} productIds
 */
async function removeProductIdsFromAllCarts(productIds) {
  const idSet = new Set(productIds.map(String).filter(Boolean));
  if (idSet.size === 0) {
    return 0;
  }

  const carts = await CartModel.find({}).select("userId items").lean();
  let updatedCarts = 0;

  for (const cart of carts) {
    const items = normalizeStoredCartItems(cart.items);
    let changed = false;

    for (const productId of idSet) {
      if (Object.prototype.hasOwnProperty.call(items, productId)) {
        delete items[productId];
        changed = true;
      }
    }

    if (!changed) {
      continue;
    }

    await CartModel.updateOne({ userId: cart.userId }, { $set: { items } });
    updatedCarts += 1;
  }

  return updatedCarts;
}

/**
 * Удаляет все товары продавца, просмотры, чистит чужие корзины и корзину продавца.
 *
 * @param {string | import('mongoose').Types.ObjectId} sellerId
 * @returns {Promise<{ deletedProductCount: number; updatedCarts: number }>}
 */
export async function deleteSellerProductsAndRelatedData(sellerId) {
  const sellerObjectId = new mongoose.Types.ObjectId(String(sellerId));

  const products = await ProductModel.find({ productSeller: sellerObjectId })
    .select("_id")
    .lean();
  const productIds = products.map((row) => String(row._id));

  if (productIds.length > 0) {
    const openIds = await getProductIdsWithOpenSales(productIds);
    if (openIds.size > 0) {
      const error = new Error(USER_DELETE_OPEN_SALES_MESSAGE);
      error.statusCode = 409;
      throw error;
    }

    const productObjectIds = products.map((row) => row._id);

    await ProductViewModel.deleteMany({
      productId: { $in: productObjectIds },
    });
    await ProductModel.deleteMany({ productSeller: sellerObjectId });

    const updatedCarts = await removeProductIdsFromAllCarts(productIds);
    await CartModel.deleteOne({ userId: sellerObjectId });

    return {
      deletedProductCount: productIds.length,
      updatedCarts,
    };
  }

  await CartModel.deleteOne({ userId: sellerObjectId });

  return { deletedProductCount: 0, updatedCarts: 0 };
}
