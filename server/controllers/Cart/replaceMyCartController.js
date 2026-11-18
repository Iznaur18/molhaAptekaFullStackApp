import { successRes } from "../../services/http/index.js";
import { replaceMyCart } from "../../services/cart/myCart.js";

/** `PUT /cart` — полная замена корзины; в ответе только доступные товары. */
export const replaceMyCartController = async (req, res) => {
  const data = await replaceMyCart({
    userId: req.userId,
    items: req.body?.items,
  });
  return successRes(res, data);
};
