import { errorRes, successRes } from "../../services/http/index.js";

import {
  normalizeStoredWishlistItems,
  syncWishlistForUser,
} from "./favoritesItemHelpers.js";
import { WishlistModel } from "../../models/index.js";

import { resolveFavoritesUserId } from "./resolveFavoritesUserId.js";

/** `GET /favorites` — список желаний с populate товаров. */
export const getMyFavoritesController = async (req, res) => {
  const userId = resolveFavoritesUserId(req.userId);
  if (!userId) {
    return errorRes(res, 401, "Не авторизован");
  }

  const doc = await WishlistModel.findOne({ userId }).lean();
  const rawItems =
    doc?.items && typeof doc.items === "object" && !Array.isArray(doc.items)
      ? doc.items
      : {};
  const normalized = normalizeStoredWishlistItems(rawItems);
  const payload = await syncWishlistForUser(req.userId, normalized);

  return successRes(res, payload);
};
