import { AppError } from "../../errors/AppError.js";
import { CartModel } from "../../models/index.js";
import { emitCartItemsAddedEvents } from "../analytics-events/index.js";
import {
  filterCartItemsToPurchasableProducts,
  normalizeStoredCartItems,
  parseReplaceCartBodyItems,
} from "./cartItemHelpers.js";
import { resolveCartUserId } from "./resolveCartUserId.js";

/**
 * @param {unknown} rawUserId
 */
function requireCartUserId(rawUserId) {
  const userId = resolveCartUserId(rawUserId);
  if (!userId) {
    throw new AppError(401, "Не авторизован");
  }
  return userId;
}

/**
 * @param {{ userId: unknown }} args
 */
export async function getMyCart({ userId: rawUserId }) {
  const userId = requireCartUserId(rawUserId);
  const doc = await CartModel.findOne({ userId }).lean();
  const rawItems =
    doc?.items && typeof doc.items === "object" && !Array.isArray(doc.items)
      ? doc.items
      : {};
  const normalized = normalizeStoredCartItems(rawItems);
  const purchasable = await filterCartItemsToPurchasableProducts(normalized, userId);

  if (!doc && Object.keys(purchasable).length === 0) {
    return { items: {} };
  }

  await CartModel.findOneAndUpdate(
    { userId },
    { $set: { items: purchasable } },
    { upsert: true, returnDocument: "after" },
  );

  return { items: purchasable };
}

/**
 * @param {{ userId: unknown; items: unknown }} args
 */
export async function replaceMyCart({ userId: rawUserId, items }) {
  const userId = requireCartUserId(rawUserId);
  const parsed = parseReplaceCartBodyItems(items);
  if (!parsed.ok) {
    throw new AppError(400, parsed.message);
  }

  const purchasable = await filterCartItemsToPurchasableProducts(parsed.items, userId);

  const previous = await CartModel.findOneAndUpdate(
    { userId },
    { $set: { items: purchasable } },
    { upsert: true, returnDocument: "before", lean: true },
  );

  const previousIds = new Set(Object.keys(previous?.items ?? {}));
  const addedIds = Object.keys(purchasable).filter((id) => !previousIds.has(id));
  if (addedIds.length > 0) {
    emitCartItemsAddedEvents({ userId: String(userId), productIds: addedIds });
  }

  return { items: purchasable };
}
