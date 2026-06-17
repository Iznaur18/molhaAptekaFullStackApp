import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { ProductModel, WishlistModel } from "../../models/index.js";
import { attachProductSellerSnapshots } from "../../utils/attachProductSellerSnapshots.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { attachProductAvailablePurchaseQuantity } from "../../utils/productStock.js";
import { applyProductWishlistCountDelta } from "../../services/product/productWishlistCount.js";

import { resolveFavoritesUserId } from "./resolveFavoritesUserId.js";

/**
 * @param {unknown} raw
 * @returns {Record<string, number>}
 */
export const normalizeStoredWishlistItems = (raw) => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return Object.entries(raw).reduce((acc, [productId, addedAt]) => {
    if (!mongoose.isValidObjectId(productId)) return acc;
    const ts = Math.floor(Number(addedAt));
    if (!Number.isFinite(ts) || ts <= 0) return acc;
    acc[String(productId)] = ts;
    return acc;
  }, {});
};

/**
 * @param {Record<string, number>} items
 * @returns {Record<string, number>}
 */
export const mergeWishlistItemsKeepEarlierAddedAt = (items) => {
  const merged = {};
  for (const [productId, addedAt] of Object.entries(items)) {
    const prev = merged[productId];
    if (prev == null || addedAt < prev) {
      merged[productId] = addedAt;
    }
  }
  return merged;
};

/**
 * @param {Record<string, number>} nextItems
 * @param {Record<string, number>} oldItems
 * @returns {Record<string, number>}
 */
export const mergeWishlistItemsWithStoredAddedAt = (nextItems, oldItems) => {
  const merged = { ...nextItems };
  for (const [productId, oldAddedAt] of Object.entries(oldItems)) {
    if (!(productId in merged)) {
      continue;
    }
    merged[productId] = Math.min(oldAddedAt, merged[productId]);
  }
  return mergeWishlistItemsKeepEarlierAddedAt(merged);
};

/**
 * @param {unknown} raw
 * @returns {{ ok: true; items: Record<string, number> } | { ok: false; message: string }}
 */
export const parseReplaceWishlistBodyItems = (raw) => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, message: "items должен быть объектом" };
  }

  const items = {};
  for (const [productId, addedAtRaw] of Object.entries(raw)) {
    if (!mongoose.isValidObjectId(productId)) continue;
    const addedAt = Math.floor(Number(addedAtRaw));
    if (!Number.isFinite(addedAt) || addedAt <= 0) {
      return {
        ok: false,
        message: "addedAt должен быть положительным timestamp (мс)",
      };
    }
    items[String(productId)] = addedAt;
  }

  return { ok: true, items: mergeWishlistItemsKeepEarlierAddedAt(items) };
};

/**
 * @param {Record<string, number>} items
 * @param {import('mongoose').Types.ObjectId} userId
 * @returns {Promise<Record<string, number>>}
 */
export const filterWishlistItemsToKeepableProducts = async (items, userId) => {
  const ids = Object.keys(items);
  if (ids.length === 0) return {};

  const oids = ids.map((id) => new mongoose.Types.ObjectId(id));
  const alive = await ProductModel.find({
    _id: { $in: oids },
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    productStockQuantity: { $gt: 0 },
    productSeller: { $ne: userId },
  })
    .select("_id")
    .lean();

  const allowed = new Set(alive.map((p) => String(p._id)));
  return Object.fromEntries(
    Object.entries(items).filter(([productId]) => allowed.has(productId)),
  );
};

/**
 * @param {Record<string, number>} items
 */
export async function populateWishlistProducts(items) {
  const ids = Object.keys(items);
  if (ids.length === 0) return [];

  const sortedIds = Object.entries(items)
    .sort(([, a], [, b]) => b - a)
    .map(([productId]) => productId);

  const products = await ProductModel.find({ _id: { $in: ids } }).lean();
  const productById = new Map(products.map((row) => [String(row._id), row]));
  const ordered = sortedIds.map((id) => productById.get(id)).filter(Boolean);
  const withSeller = await attachProductSellerSnapshots(ordered);
  return attachProductAvailablePurchaseQuantity(withSeller);
};

/**
 * @param {Record<string, number>} items
 * @param {import('../utils/productStock.js').ProductFromApi[]} products
 */
function reconcileWishlistItemsWithProducts(items, products) {
  const productIds = new Set(products.map((product) => String(product._id)));
  const reconciled = Object.fromEntries(
    Object.entries(items).filter(([productId]) => productIds.has(productId)),
  );
  const ghostIds = Object.keys(items).filter((productId) => !productIds.has(productId));
  return { reconciled, ghostIds };
};

/**
 * @param {unknown} userId
 * @param {Record<string, number>} nextItems
 */
export async function syncWishlistForUser(userId, nextItems) {
  const userObjectId = resolveFavoritesUserId(userId);
  if (!userObjectId) {
    throw new Error("INVALID_USER");
  }

  return runInTransaction(async (session) => {
    const doc = await WishlistModel.findOne({ userId: userObjectId })
      .session(session ?? undefined)
      .lean();
    const oldItems = normalizeStoredWishlistItems(doc?.items);
    const mergedInput = mergeWishlistItemsWithStoredAddedAt(nextItems, oldItems);
    const filtered = await filterWishlistItemsToKeepableProducts(
      mergedInput,
      userObjectId,
    );

    const oldKeys = new Set(Object.keys(oldItems));
    const newKeys = new Set(Object.keys(filtered));
    const added = [...newKeys].filter((id) => !oldKeys.has(id));
    const removed = [...oldKeys].filter((id) => !newKeys.has(id));

    if (!doc && Object.keys(filtered).length === 0) {
      return { items: {}, products: [] };
    }

    await WishlistModel.findOneAndUpdate(
      { userId: userObjectId },
      { $set: { items: filtered } },
      withMongoSession({ upsert: true }, session),
    );

    let products = await populateWishlistProducts(filtered);
    let finalItems = filtered;
    const { reconciled, ghostIds } = reconcileWishlistItemsWithProducts(
      filtered,
      products,
    );

    if (ghostIds.length > 0) {
      finalItems = reconciled;
      await WishlistModel.updateOne(
        { userId: userObjectId },
        { $set: { items: finalItems } },
        withMongoSession({}, session),
      );
      products = products.filter((product) =>
        Object.prototype.hasOwnProperty.call(finalItems, String(product._id)),
      );
    }

    const countRemoved = [...new Set([...removed, ...ghostIds])];
    const countAdded = added.filter((id) => !ghostIds.includes(id));

    if (countAdded.length > 0 || countRemoved.length > 0) {
      await applyProductWishlistCountDelta({
        incrementIds: countAdded,
        decrementIds: countRemoved,
        session,
      });
    }

    return { items: finalItems, products };
  });
}

/**
 * @param {import('mongoose').Types.ObjectId} userObjectId
 * @param {import('mongoose').ClientSession | null} [session]
 */
export async function deleteUserWishlistAndDecrementCounts(userObjectId, session = null) {
  const doc = await WishlistModel.findOne({ userId: userObjectId })
    .select("items")
    .session(session ?? undefined)
    .lean();
  const items = normalizeStoredWishlistItems(doc?.items);
  const productIds = Object.keys(items);

  if (productIds.length > 0) {
    await applyProductWishlistCountDelta({
      decrementIds: productIds,
      session,
    });
  }

  await WishlistModel.deleteOne(
    { userId: userObjectId },
    withMongoSession({}, session),
  );
}

/**
 * @param {string[]} productIds
 */
export async function removeProductIdsFromAllWishlists(productIds) {
  const idSet = new Set(productIds.map(String).filter(Boolean));
  if (idSet.size === 0) {
    return 0;
  }

  const wishlists = await WishlistModel.find({}).select("userId items").lean();
  let updated = 0;

  for (const wishlist of wishlists) {
    const items = normalizeStoredWishlistItems(wishlist.items);
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

    await WishlistModel.updateOne({ userId: wishlist.userId }, { $set: { items } });
    updated += 1;
  }

  return updated;
}
