import { successRes } from "../../services/http/index.js";
import { getMyCart } from "../../services/cart/myCart.js";

/** `GET /cart` — корзина текущего пользователя; недоступные позиции выкидываются и сохраняются. */
export const getMyCartController = async (req, res) => {
  const data = await getMyCart({ userId: req.userId });
  return successRes(res, data);
};
