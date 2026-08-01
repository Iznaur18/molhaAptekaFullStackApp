import { createOrder } from "../../services/order/createOrder.js";
import { runMoneyIdempotentMutation } from "../../services/loyalty/runMoneyIdempotentMutation.js";
import { successRes } from "../../services/http/index.js";

import { ORDER_BUYER_PUBLIC_FIELDS, ORDER_ITEMS_POPULATE } from "./orderQueries.js";

/** `POST /order` — создание заказа авторизованным пользователем. */
export const makeOrderController = async (req, res) => {
  const payload = await runMoneyIdempotentMutation({
    scope: "create_order",
    actorUserId: req.userId,
    idempotencyKey: req.body.idempotencyKey,
    execute: async () => {
      const order = await createOrder({
        userId: req.userId,
        items: req.body.items,
        paymentMethod: req.body.paymentMethod,
        priceOfferId: req.body.priceOfferId,
        fulfillmentMethod: req.body.fulfillmentMethod,
        verifiedDeliveryAddress: req.verifiedDeliveryAddress,
        affiliateCode: req.body.affiliateCode,
      });

      await order.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
      await order.populate(ORDER_ITEMS_POPULATE);

      const plain = typeof order.toObject === "function" ? order.toObject() : order;

      return {
        message: "Заказ успешно создан",
        order: plain,
      };
    },
  });

  return successRes(res, payload);
};
