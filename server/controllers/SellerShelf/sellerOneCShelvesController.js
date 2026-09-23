import { successRes } from "../../services/http/index.js";
import { listSellerOneCShelves } from "../../services/seller-shelf/sellerOneCShelves.js";

/** `GET /seller-shelf/seller/:sellerId/onec` — полки витрины из групп 1С. */
export const listPublicSellerOneCShelvesController = async (req, res) => {
  const shelves = await listSellerOneCShelves(String(req.params.sellerId));
  return successRes(res, { shelves });
};
