import mongoose from "mongoose";

import { CartModel, ProductModel } from "../../models/index.js";
import { normalizeStoredCartItems } from "../../controllers/Cart/cartItemHelpers.js";

/**
 * Удаляет из корзины `blockedId` товары продавца `blockerId`.
 *
 * @param {string} blockerId
 * @param {string} blockedId
 */
export async function removeBlockedSellerProductsFromUserCart(blockerId, blockedId) {
  const cart = await CartModel.findOne({ userId: blockedId }).lean();
  if (!cart?.items) {
    return { removedProductIds: [] };
  }

  const items = normalizeStoredCartItems(cart.items);
  const productIds = Object.keys(items);
  if (productIds.length === 0) {
    return { removedProductIds: [] };
  }

  const sellerOid = new mongoose.Types.ObjectId(blockerId);
  const blockedProducts = await ProductModel.find({
    _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
    productSeller: sellerOid,
  })
    .select("_id")
    .lean();

  if (blockedProducts.length === 0) {
    return { removedProductIds: [] };
  }

  const removeIds = new Set(blockedProducts.map((product) => String(product._id)));
  const nextItems = Object.fromEntries(
    Object.entries(items).filter(([productId]) => !removeIds.has(productId)),
  );

  await CartModel.updateOne({ userId: blockedId }, { $set: { items: nextItems } });

  return { removedProductIds: [...removeIds] };
}
