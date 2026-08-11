import {
  ONEC_EXCHANGE_DIRECTION_PUSH,
  ONEC_EXCHANGE_STATUS_ERROR,
  ONEC_EXCHANGE_STATUS_SUCCESS,
  ONEC_ORDER_PUSH_FAILED,
  ONEC_ORDER_PUSH_MAX_ATTEMPTS,
  ONEC_ORDER_PUSH_PENDING,
  ONEC_ORDER_PUSH_SYNCED,
} from "../../constants/onecConstants.js";
import {
  OneCExchangeLogModel,
  OneCOrderPushModel,
  OrderModel,
  ProductModel,
} from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { postOneCCustomerOrder } from "./onecHttpClient.js";
import { resolveSellerOneCCredentials } from "./onecSettings.js";

/**
 * После создания заказа — поставить push в очередь для продавцов с 1С.
 * @param {import("mongoose").Document | Record<string, unknown>} order
 */
export async function enqueueOneCOrderPushesForOrder(order) {
  const orderId = order?._id;
  if (!orderId) return { enqueued: 0 };

  const productIds = (order.items ?? [])
    .map((item) => item.productId?._id ?? item.productId)
    .filter(Boolean);

  if (productIds.length === 0) return { enqueued: 0 };

  const products = await ProductModel.find({ _id: { $in: productIds } })
    .select("_id productSeller product1cGuid productFromOneC")
    .lean();

  const sellerIds = [
    ...new Set(
      products
        .map((p) => String(p.productSeller))
        .filter(Boolean),
    ),
  ];

  if (sellerIds.length === 0) return { enqueued: 0 };

  const { UserModel } = await import("../../models/index.js");
  const sellers = await UserModel.find({
    _id: { $in: sellerIds },
    "oneCIntegration.enabled": true,
  })
    .select("_id")
    .lean();

  const enabledSellerIds = new Set(sellers.map((s) => String(s._id)));
  let enqueued = 0;

  for (const sellerId of enabledSellerIds) {
    try {
      await OneCOrderPushModel.updateOne(
        { orderId, sellerId },
        {
          $setOnInsert: {
            orderId,
            sellerId,
            status: ONEC_ORDER_PUSH_PENDING,
            attempts: 0,
            lastError: "",
            externalId: null,
            syncedAt: null,
          },
        },
        { upsert: true },
      );
      enqueued += 1;
    } catch (error) {
      // duplicate key — уже есть
      if (error?.code !== 11000) {
        logServerEvent("error", {
          event: "onec.order_push_enqueue_failed",
          orderId: String(orderId),
          ...formatLogError(error),
        });
      }
    }
  }

  return { enqueued };
}

/**
 * @param {string} sellerId
 * @param {{ triggeredBy?: "cron" | "manual" | "order_create"; limit?: number }} [opts]
 */
export async function pushPendingSellerOrders(sellerId, opts = {}) {
  const triggeredBy = opts.triggeredBy ?? "cron";
  const limit = Math.min(50, Math.max(1, Number(opts.limit) || 20));
  const creds = await resolveSellerOneCCredentials(sellerId);

  const pending = await OneCOrderPushModel.find({
    sellerId,
    status: { $in: [ONEC_ORDER_PUSH_PENDING, ONEC_ORDER_PUSH_FAILED] },
    attempts: { $lt: ONEC_ORDER_PUSH_MAX_ATTEMPTS },
  })
    .sort({ createdAt: 1 })
    .limit(limit);

  let synced = 0;
  let failed = 0;

  for (const push of pending) {
    try {
      const order = await OrderModel.findById(push.orderId).lean();
      if (!order) {
        push.status = ONEC_ORDER_PUSH_FAILED;
        push.lastError = "Заказ не найден";
        push.attempts += 1;
        await push.save();
        failed += 1;
        continue;
      }

      const productIds = order.items.map((i) => i.productId);
      const products = await ProductModel.find({
        _id: { $in: productIds },
        productSeller: sellerId,
      })
        .select("_id product1cGuid productArticle productName")
        .lean();

      const productById = new Map(products.map((p) => [String(p._id), p]));

      const lineItems = [];
      for (const item of order.items) {
        const product = productById.get(String(item.productId));
        if (!product) continue;
        if (!product.product1cGuid) {
          throw new Error(
            `Товар «${product.productName}» без 1cGuid — нельзя выгрузить в 1С`,
          );
        }
        lineItems.push({
          guid: product.product1cGuid,
          article: product.productArticle || "",
          name: item.productNameAtOrder || product.productName,
          quantity: item.quantity,
          price: item.unitPriceAtOrder,
        });
      }

      if (lineItems.length === 0) {
        push.status = ONEC_ORDER_PUSH_FAILED;
        push.lastError = "В заказе нет позиций этого продавца с 1cGuid";
        push.attempts += 1;
        await push.save();
        failed += 1;
        continue;
      }

      const externalKey = `${String(order._id)}:${String(sellerId)}`;
      const result = await postOneCCustomerOrder({
        ...creds,
        payload: {
          externalId: externalKey,
          orderId: String(order._id),
          createdAt: order.createdAt,
          fulfillmentMethod: order.fulfillmentMethod,
          deliveryAddress: order.deliveryAddress,
          deliveryAddressFlat: order.deliveryAddressFlat || "",
          items: lineItems,
          totalAmount: lineItems.reduce(
            (sum, row) => sum + row.price * row.quantity,
            0,
          ),
        },
      });

      push.status = ONEC_ORDER_PUSH_SYNCED;
      push.externalId = result.externalId;
      push.syncedAt = new Date();
      push.lastError = "";
      push.attempts += 1;
      await push.save();
      synced += 1;

      await OneCExchangeLogModel.create({
        sellerId,
        direction: ONEC_EXCHANGE_DIRECTION_PUSH,
        status: ONEC_EXCHANGE_STATUS_SUCCESS,
        message: `Заказ ${order._id} → 1С`,
        summary: { externalId: result.externalId, lines: lineItems.length },
        orderId: order._id,
        triggeredBy,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка выгрузки заказа";
      push.status = ONEC_ORDER_PUSH_FAILED;
      push.lastError = message.slice(0, 2000);
      push.attempts += 1;
      await push.save();
      failed += 1;

      await OneCExchangeLogModel.create({
        sellerId,
        direction: ONEC_EXCHANGE_DIRECTION_PUSH,
        status: ONEC_EXCHANGE_STATUS_ERROR,
        message: message.slice(0, 2000),
        orderId: push.orderId,
        triggeredBy,
      });
    }
  }

  return { processed: pending.length, synced, failed };
}
