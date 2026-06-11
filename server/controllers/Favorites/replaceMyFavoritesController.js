import { errorRes, successRes } from "../../utils/index.js";

import {
  parseReplaceWishlistBodyItems,
  syncWishlistForUser,
} from "./favoritesItemHelpers.js";
import { resolveFavoritesUserId } from "./resolveFavoritesUserId.js";

/** `PUT /favorites` — полная замена списка желаний. */
export const replaceMyFavoritesController = async (req, res) => {
  try {
    const userId = resolveFavoritesUserId(req.userId);
    if (!userId) {
      return errorRes(res, 401, "Не авторизован");
    }

    const parsed = parseReplaceWishlistBodyItems(req.body?.items);
    if (!parsed.ok) {
      return errorRes(res, 400, parsed.message);
    }

    const payload = await syncWishlistForUser(req.userId, parsed.items);
    return successRes(res, payload);
  } catch (error) {
    console.error("replaceMyFavoritesController error:", error);
    return errorRes(res, 500, "Не удалось сохранить список желаний");
  }
};
