import { successRes } from "../../services/http/index.js";
import { updateOrderStatusByAdmin } from "../../services/order/updateOrderStatusByAdmin.js";

/** `PATCH /order/:orderId/status` — смена статуса заказа (только админ). */
export const updateOrderStatusController = async (req, res) => {
  const data = await updateOrderStatusByAdmin({
    orderId: String(req.params.orderId),
    status: req.body.status,
  });
  return successRes(res, data);
};
