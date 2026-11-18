import { successRes } from "../../services/http/index.js";
import { replaceMyFavorites } from "../../services/favorites/myFavorites.js";

/** `PUT /favorites` — полная замена списка желаний. */
export const replaceMyFavoritesController = async (req, res) => {
  const data = await replaceMyFavorites({
    userId: req.userId,
    items: req.body?.items,
  });
  return successRes(res, data);
};
