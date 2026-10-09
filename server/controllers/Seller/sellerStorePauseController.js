import {
  getSellerStorePause,
  setSellerStorePause,
} from "../../services/seller/sellerStorePause.js";
import { successRes } from "../../services/http/index.js";

/** `GET /sellers/store-pause/me` — на паузе ли магазин и сколько товаров затронуто. */
export const getMySellerStorePauseController = async (req, res) => {
  const storePause = await getSellerStorePause(String(req.userId));
  return successRes(res, { storePause });
};

/** `PUT /sellers/store-pause` — скрыть все товары разом или вернуть их на витрину. */
export const putMySellerStorePauseController = async (req, res) => {
  const storePause = await setSellerStorePause({
    userId: String(req.userId),
    paused: req.body.paused,
  });
  return successRes(res, { storePause });
};
