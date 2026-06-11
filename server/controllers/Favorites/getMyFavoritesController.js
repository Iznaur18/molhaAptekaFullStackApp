import { errorRes, successRes } from "../../utils/index.js";

import {
  normalizeStoredWishlistItems,
  syncWishlistForUser,
} from "./favoritesItemHelpers.js";
import { WishlistModel } from "../../models/index.js";

import { resolveFavoritesUserId } from "./resolveFavoritesUserId.js";

/** `GET /favorites` — список желаний с populate товаров. */
export const getMyFavoritesController = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("getMyFavoritesController error:", error);
    return errorRes(res, 500, "Не удалось загрузить список желаний");
  }
};
