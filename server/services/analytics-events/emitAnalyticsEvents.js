import {
  ANALYTICS_EVENT_AD_CLICK,
  ANALYTICS_EVENT_AD_IMPRESSION,
  ANALYTICS_EVENT_ORDER_CREATED,
  ANALYTICS_EVENT_ORDER_ITEM_SOLD,
  ANALYTICS_EVENT_PRODUCT_VIEWED,
  ANALYTICS_EVENT_USER_REGISTERED,
  ANALYTICS_VIEW_VELOCITY_MAX,
  ANALYTICS_VIEW_VELOCITY_WINDOW_MS,
} from "../../constants/analyticsEventConstants.js";
import { AnalyticsEventModel } from "../../models/index.js";
import { enqueueAnalyticsEvent } from "./insertAnalyticsEventIdempotent.js";

/**
 * @param {{ userId: string; channel?: string }} params
 */
export function emitUserRegisteredEvent({ userId, channel = "unknown" }) {
  const id = String(userId);
  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_USER_REGISTERED,
    idempotencyKey: `user.registered:${id}`,
    actorUserId: id,
    subjectType: "user",
    subjectId: id,
    payload: { channel },
  });
}

/**
 * @param {{
 *   productId: string;
 *   viewerUserId: string;
 *   sellerUserId?: string | null;
 * }} params
 */
export async function emitProductViewedEvent({
  productId,
  viewerUserId,
  sellerUserId = null,
}) {
  const fraudReasons = [];
  if (sellerUserId && String(sellerUserId) === String(viewerUserId)) {
    fraudReasons.push("own_product");
  }

  const since = new Date(Date.now() - ANALYTICS_VIEW_VELOCITY_WINDOW_MS);
  const recentViews = await AnalyticsEventModel.countDocuments({
    eventType: ANALYTICS_EVENT_PRODUCT_VIEWED,
    actorUserId: viewerUserId,
    occurredAt: { $gte: since },
  });
  if (recentViews >= ANALYTICS_VIEW_VELOCITY_MAX) {
    fraudReasons.push("view_velocity");
  }

  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_PRODUCT_VIEWED,
    idempotencyKey: `product.viewed:${productId}:${viewerUserId}`,
    actorUserId: viewerUserId,
    subjectType: "product",
    subjectId: String(productId),
    payload: { sellerUserId: sellerUserId ? String(sellerUserId) : null },
    suspectedFraud: fraudReasons.length > 0,
    fraudReasons,
  });
}

/**
 * @param {{
 *   orderId: string;
 *   buyerUserId: string;
 *   totalAmount: number;
 *   itemCount: number;
 *   sellerUserIds?: string[];
 * }} params
 */
export function emitOrderCreatedEvent({
  orderId,
  buyerUserId,
  totalAmount,
  itemCount,
  sellerUserIds = [],
}) {
  const fraudReasons = [];
  const buyer = String(buyerUserId);
  if (sellerUserIds.some((id) => String(id) === buyer)) {
    fraudReasons.push("buyer_is_seller");
  }

  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_ORDER_CREATED,
    idempotencyKey: `order.created:${orderId}`,
    actorUserId: buyer,
    subjectType: "order",
    subjectId: String(orderId),
    payload: {
      totalAmount: Number(totalAmount) || 0,
      itemCount: Number(itemCount) || 0,
    },
    suspectedFraud: fraudReasons.length > 0,
    fraudReasons,
  });
}

/**
 * @param {{
 *   orderId: string;
 *   itemIndex: number;
 *   productId: string;
 *   buyerUserId?: string | null;
 *   sellerUserId?: string | null;
 *   quantity: number;
 *   unitPriceAtOrder?: number;
 *   status: string;
 * }} params
 */
export function emitOrderItemSoldEvent({
  orderId,
  itemIndex,
  productId,
  buyerUserId = null,
  sellerUserId = null,
  quantity,
  unitPriceAtOrder = 0,
  status,
}) {
  const qty = Math.max(0, Number(quantity) || 0);
  const price = Math.max(0, Number(unitPriceAtOrder) || 0);
  const fraudReasons = [];
  if (
    buyerUserId &&
    sellerUserId &&
    String(buyerUserId) === String(sellerUserId)
  ) {
    fraudReasons.push("buyer_is_seller");
  }

  enqueueAnalyticsEvent({
    eventType: ANALYTICS_EVENT_ORDER_ITEM_SOLD,
    idempotencyKey: `order.item_sold:${orderId}:${itemIndex}`,
    actorUserId: buyerUserId || null,
    subjectType: "order_item",
    subjectId: `${orderId}:${itemIndex}`,
    payload: {
      productId: String(productId),
      quantity: qty,
      unitPriceAtOrder: price,
      lineAmount: qty * price,
      status,
      sellerUserId: sellerUserId ? String(sellerUserId) : null,
    },
    suspectedFraud: fraudReasons.length > 0,
    fraudReasons,
  });
}

/**
 * @param {{
 *   kind: 'impression' | 'click';
 *   surface: string;
 *   subjectId: string;
 *   actorUserId?: string | null;
 *   campaignId?: string | null;
 * }} params
 */
export function emitAdEvent({
  kind,
  surface,
  subjectId,
  actorUserId = null,
  campaignId = null,
}) {
  const eventType =
    kind === "click" ? ANALYTICS_EVENT_AD_CLICK : ANALYTICS_EVENT_AD_IMPRESSION;
  const actorPart = actorUserId ? String(actorUserId) : "anon";
  const bucket = Math.floor(Date.now() / (60 * 1000));
  const idempotencyKey =
    kind === "click"
      ? `${eventType}:${surface}:${subjectId}:${actorPart}:${bucket}`
      : `${eventType}:${surface}:${subjectId}:${actorPart}:${bucket}`;

  enqueueAnalyticsEvent({
    eventType,
    idempotencyKey,
    actorUserId: actorUserId || null,
    subjectType: surface,
    subjectId: String(subjectId),
    payload: {
      surface,
      campaignId: campaignId ? String(campaignId) : null,
    },
  });
}
