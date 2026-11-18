import { successRes } from "../../services/http/index.js";
import { getMySales } from "../../services/order/getMySales.js";

/** `GET /order/sales` — продажи текущего продавца. */
export const getMySalesController = async (req, res) => {
  const data = await getMySales({
    sellerId: String(req.userId),
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    search: req.query.search,
    productIds: req.query.productIds,
  });
  return successRes(res, data);
};
