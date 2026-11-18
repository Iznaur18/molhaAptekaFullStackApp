import { AppError } from "../../errors/AppError.js";
import { WishlistModel } from "../../models/index.js";
import {
  normalizeStoredWishlistItems,
  parseReplaceWishlistBodyItems,
  syncWishlistForUser,
} from "./favoritesItemHelpers.js";
import { resolveFavoritesUserId } from "./resolveFavoritesUserId.js";

/**
 * @param {unknown} rawUserId
 */
function requireFavoritesUserId(rawUserId) {
  const userId = resolveFavoritesUserId(rawUserId);
  if (!userId) {
    throw new AppError(401, "Не авторизован");
  }
  return userId;
}

/**
 * @param {{ userId: unknown }} args
 */
export async function getMyFavorites({ userId: rawUserId }) {
  const userId = requireFavoritesUserId(rawUserId);
  const doc = await WishlistModel.findOne({ userId }).lean();
  const rawItems =
    doc?.items && typeof doc.items === "object" && !Array.isArray(doc.items)
      ? doc.items
      : {};
  const normalized = normalizeStoredWishlistItems(rawItems);
  return syncWishlistForUser(rawUserId, normalized);
}

/**
 * @param {{ userId: unknown; items: unknown }} args
 */
export async function replaceMyFavorites({ userId: rawUserId, items }) {
  requireFavoritesUserId(rawUserId);
  const parsed = parseReplaceWishlistBodyItems(items);
  if (!parsed.ok) {
    throw new AppError(400, parsed.message);
  }
  return syncWishlistForUser(rawUserId, parsed.items);
}
