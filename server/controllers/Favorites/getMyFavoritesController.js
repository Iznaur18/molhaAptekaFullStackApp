import { successRes } from "../../services/http/index.js";
import { getMyFavorites } from "../../services/favorites/myFavorites.js";

/** `GET /favorites` — список желаний с populate товаров. */
export const getMyFavoritesController = async (req, res) => {
  const data = await getMyFavorites({ userId: req.userId });
  return successRes(res, data);
};
