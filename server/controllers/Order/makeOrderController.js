import { createOrder } from "../../services/order/createOrder.js";
import { successRes } from "../../services/http/index.js";

import { ORDER_BUYER_PUBLIC_FIELDS, ORDER_ITEMS_POPULATE } from "./orderQueries.js";

/** `POST /order` — создание заказа авторизованным пользователем. */
export const makeOrderController = async (req, res) => {
  const order = await createOrder({
    userId: req.userId,
    items: req.body.items,
    paymentMethod: req.body.paymentMethod,
    priceOfferId: req.body.priceOfferId,
    verifiedDeliveryAddress: req.verifiedDeliveryAddress,
  });

  await order.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
  await order.populate(ORDER_ITEMS_POPULATE);

  return successRes(res, { message: "Заказ успешно создан", order });
};
