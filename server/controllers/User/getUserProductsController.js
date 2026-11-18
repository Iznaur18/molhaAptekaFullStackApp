import { successRes } from "../../services/http/index.js";
import { getUserSellerProducts } from "../../services/user/getUserSellerProducts.js";

/** `GET /user/:userIdClient/products` — товары продавца в каталоге (публично, JWT опционален). */
export const getUserProductsController = async (req, res) => {
  const data = await getUserSellerProducts({
    targetUserId: String(req.params.userIdClient),
    viewerUserId: req.userId ?? null,
    query: req.query ?? {},
    req,
  });
  return successRes(res, data);
};
