import { OrderModel } from "../../models/index.js";
import { createOrder } from "../../services/order/createOrder.js";
import { runMoneyIdempotentMutation } from "../../services/loyalty/runMoneyIdempotentMutation.js";
import { successRes } from "../../services/http/index.js";
import { enqueueOneCOrderPushesForOrder } from "../../services/onec/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

import { ORDER_BUYER_PUBLIC_FIELDS, ORDER_ITEMS_POPULATE } from "./orderQueries.js";

const hydrateCreateOrderResponse = async (payload) => {
  if (!payload?.duplicate || payload.order || !payload.orderId) {
    return payload;
  }

  const order = await OrderModel.findById(String(payload.orderId));
  if (!order) {
    return payload;
  }

  await order.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
  await order.populate(ORDER_ITEMS_POPULATE);

  const plain = typeof order.toObject === "function" ? order.toObject() : order;
  const { duplicate: _ignored, ...rest } = payload;

  return {
    ...rest,
    message: rest.message ?? "Заказ успешно создан",
    order: plain,
  };
};

/** `POST /order` — создание заказа авторизованным пользователем. */
export const makeOrderController = async (req, res) => {
  const payload = await runMoneyIdempotentMutation({
    scope: "create_order",
    actorUserId: req.userId,
    idempotencyKey: req.body.idempotencyKey,
    execute: async ({ storePartial }) => {
      const order = await createOrder({
        userId: req.userId,
        items: req.body.items,
        paymentMethod: req.body.paymentMethod,
        priceOfferId: req.body.priceOfferId,
        fulfillmentMethod: req.body.fulfillmentMethod,
        fulfillmentBySellerId: req.body.fulfillmentBySellerId,
        pickupSelections: req.body.pickupSelections,
        verifiedDeliveryAddress: req.verifiedDeliveryAddress,
        affiliateCode: req.body.affiliateCode,
      });

      const orderId = String(order._id);
      await storePartial({ orderId });

      try {
        await enqueueOneCOrderPushesForOrder(order);
      } catch (error) {
        logServerEvent("error", {
          event: "onec_order_enqueue_failed",
          orderId,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      await order.populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS);
      await order.populate(ORDER_ITEMS_POPULATE);

      const plain = typeof order.toObject === "function" ? order.toObject() : order;

      return {
        message: "Заказ успешно создан",
        order: plain,
        orderId,
      };
    },
  });

  return successRes(res, await hydrateCreateOrderResponse(payload));
};
