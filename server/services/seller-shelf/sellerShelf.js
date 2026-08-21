import mongoose from "mongoose";

import {
  SELLER_SHELF_MAX_PER_SELLER,
  SELLER_SHELF_NAME_MAX_CHARS,
} from "../../constants/sellerShelfConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import { ProductModel, SellerShelfModel } from "../../models/index.js";

const { ObjectId } = mongoose.Types;

/**
 * @param {Record<string, unknown>} row
 * @param {number} productCount
 */
export const toSellerShelfPayload = (row, productCount = 0) => ({
  _id: String(row._id),
  sellerId: String(row.sellerId),
  name: String(row.name ?? "").trim(),
  sortOrder: Math.floor(Number(row.sortOrder) || 0),
  productCount: Math.max(0, Math.floor(Number(productCount) || 0)),
  ...(row.createdAt ? { createdAt: new Date(row.createdAt).toISOString() } : {}),
  ...(row.updatedAt ? { updatedAt: new Date(row.updatedAt).toISOString() } : {}),
});

/**
 * @param {string} sellerId
 * @param {import('mongoose').Types.ObjectId[]} shelfObjectIds
 * @param {{ storefrontOnly?: boolean }} [opts]
 */
async function countProductsByShelfIds(sellerId, shelfObjectIds, opts = {}) {
  if (shelfObjectIds.length === 0) {
    return new Map();
  }

  const match = {
    productSeller: new ObjectId(sellerId),
    sellerShelfId: { $in: shelfObjectIds },
  };

  if (opts.storefrontOnly) {
    match.productModerationStatus = PRODUCT_MODERATION_APPROVED;
    match.productIsAvailable = { $ne: false };
  }

  const rows = await ProductModel.aggregate([
    { $match: match },
    { $group: { _id: "$sellerShelfId", count: { $sum: 1 } } },
  ]);

  /** @type {Map<string, number>} */
  const map = new Map();
  for (const row of rows) {
    map.set(String(row._id), row.count);
  }
  return map;
}

/**
 * @param {string} userId
 */
export async function listMySellerShelves({ userId }) {
  const shelves = await SellerShelfModel.find({ sellerId: userId })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const counts = await countProductsByShelfIds(
    userId,
    shelves.map((s) => s._id),
  );

  return {
    shelves: shelves.map((row) =>
      toSellerShelfPayload(row, counts.get(String(row._id)) ?? 0),
    ),
    maxShelves: SELLER_SHELF_MAX_PER_SELLER,
    nameMaxChars: SELLER_SHELF_NAME_MAX_CHARS,
  };
}

/**
 * Публичный список полок витрины — только с товарами в каталоге.
 * @param {string} sellerId
 */
export async function listPublicSellerShelves({ sellerId }) {
  const shelves = await SellerShelfModel.find({ sellerId })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const counts = await countProductsByShelfIds(
    sellerId,
    shelves.map((s) => s._id),
    { storefrontOnly: true },
  );

  const visible = shelves
    .map((row) => toSellerShelfPayload(row, counts.get(String(row._id)) ?? 0))
    .filter((row) => row.productCount > 0);

  return {
    shelves: visible,
    maxShelves: SELLER_SHELF_MAX_PER_SELLER,
    nameMaxChars: SELLER_SHELF_NAME_MAX_CHARS,
  };
}

/**
 * @param {{ userId: string; name: string }} input
 */
export async function createSellerShelf({ userId, name }) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) {
    throw new AppError(400, "Укажите название полки");
  }

  const count = await SellerShelfModel.countDocuments({ sellerId: userId });
  if (count >= SELLER_SHELF_MAX_PER_SELLER) {
    throw new AppError(
      409,
      `Можно создать не больше ${SELLER_SHELF_MAX_PER_SELLER} полок`,
    );
  }

  const last = await SellerShelfModel.findOne({ sellerId: userId })
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  const sortOrder = Math.floor(Number(last?.sortOrder) || 0) + 1;

  const created = await SellerShelfModel.create({
    sellerId: userId,
    name: trimmed,
    sortOrder,
  });

  return toSellerShelfPayload(created.toObject(), 0);
}

/**
 * @param {{ userId: string; shelfId: string; name?: string; sortOrder?: number }} input
 */
export async function patchSellerShelf({ userId, shelfId, name, sortOrder }) {
  const shelf = await SellerShelfModel.findById(shelfId);
  if (!shelf) {
    throw new AppError(404, "Полка не найдена");
  }
  if (String(shelf.sellerId) !== String(userId)) {
    throw new AppError(403, "Можно менять только свои полки");
  }

  if (name != null) {
    const trimmed = String(name).trim();
    if (!trimmed) {
      throw new AppError(400, "Укажите название полки");
    }
    shelf.name = trimmed;
  }
  if (sortOrder != null) {
    shelf.sortOrder = Math.floor(Number(sortOrder) || 0);
  }

  await shelf.save();
  const counts = await countProductsByShelfIds(userId, [shelf._id]);
  return toSellerShelfPayload(shelf.toObject(), counts.get(String(shelf._id)) ?? 0);
}

/**
 * @param {{ userId: string; orderedShelfIds: string[] }} input
 */
export async function reorderSellerShelves({ userId, orderedShelfIds }) {
  const shelves = await SellerShelfModel.find({ sellerId: userId }).lean();
  const ownedIds = new Set(shelves.map((s) => String(s._id)));
  const uniqueOrdered = [...new Set(orderedShelfIds.map(String))];

  if (uniqueOrdered.length !== shelves.length) {
    throw new AppError(400, "Передайте полный список своих полок");
  }
  for (const id of uniqueOrdered) {
    if (!ownedIds.has(id)) {
      throw new AppError(403, "Можно менять порядок только своих полок");
    }
  }

  await Promise.all(
    uniqueOrdered.map((id, index) =>
      SellerShelfModel.updateOne(
        { _id: id, sellerId: userId },
        { $set: { sortOrder: index } },
      ),
    ),
  );

  return listMySellerShelves({ userId });
}

/**
 * @param {{ userId: string; shelfId: string }} input
 */
export async function deleteSellerShelf({ userId, shelfId }) {
  const shelf = await SellerShelfModel.findById(shelfId);
  if (!shelf) {
    throw new AppError(404, "Полка не найдена");
  }
  if (String(shelf.sellerId) !== String(userId)) {
    throw new AppError(403, "Можно удалять только свои полки");
  }

  await ProductModel.updateMany(
    { productSeller: userId, sellerShelfId: shelf._id },
    { $set: { sellerShelfId: null } },
  );
  await shelf.deleteOne();

  return { ok: true };
}

/**
 * Назначить товары на полку (ровно этот набор). Остальные с этой полки снимаются.
 * @param {{ userId: string; shelfId: string; productIds: string[] }} input
 */
export async function setSellerShelfProducts({ userId, shelfId, productIds }) {
  const shelf = await SellerShelfModel.findById(shelfId).lean();
  if (!shelf) {
    throw new AppError(404, "Полка не найдена");
  }
  if (String(shelf.sellerId) !== String(userId)) {
    throw new AppError(403, "Можно менять только свои полки");
  }

  const uniqueIds = [...new Set(productIds.map(String))];
  if (uniqueIds.length > 0) {
    const ownedCount = await ProductModel.countDocuments({
      _id: { $in: uniqueIds },
      productSeller: userId,
    });
    if (ownedCount !== uniqueIds.length) {
      throw new AppError(403, "Можно назначать только свои товары");
    }
  }

  await ProductModel.updateMany(
    { productSeller: userId, sellerShelfId: shelf._id },
    { $set: { sellerShelfId: null } },
  );

  if (uniqueIds.length > 0) {
    await ProductModel.updateMany(
      { _id: { $in: uniqueIds }, productSeller: userId },
      { $set: { sellerShelfId: shelf._id } },
    );
  }

  return toSellerShelfPayload(shelf, uniqueIds.length);
}
