import webpush from "web-push";

import { WEB_PUSH_SUBSCRIPTIONS_MAX_PER_USER } from "../../constants/webPushConstants.js";
import { UserModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/** @type {boolean} */
let vapidConfigured = false;

const ensureVapidConfigured = () => {
  if (vapidConfigured) {
    return true;
  }
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:support@gitorg.ru";
  if (!publicKey || !privateKey) {
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
};

export const getWebPushVapidPublicKey = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  return publicKey || null;
};

export const isWebPushConfigured = () => Boolean(getWebPushVapidPublicKey() && process.env.VAPID_PRIVATE_KEY?.trim());

/**
 * @param {{
 *   kind: string;
 *   productId?: string | null;
 *   actorUserId?: string | null;
 *   notificationId?: string | null;
 * }} params
 * @returns {string}
 */
export function buildWebPushClickPath(params) {
  if (params.productId) {
    return `/product/${encodeURIComponent(String(params.productId))}`;
  }

  const kind = String(params.kind ?? "");

  if (kind === "user_new_follower" && params.actorUserId) {
    return `/subscriptions`;
  }
  if (kind === "user_blocked_by_seller" && params.actorUserId) {
    return `/user/${encodeURIComponent(String(params.actorUserId))}`;
  }
  if (kind === "product_price_offer_seller" || kind === "price_offer_seller") {
    return `/auction`;
  }
  if (kind === "seller_new_order") {
    return `/my-sales`;
  }
  if (kind === "buyer_order_status") {
    return `/my-orders`;
  }
  if (kind.includes("premium")) {
    return `/premium`;
  }
  if (kind.includes("data_confirmation")) {
    return `/data-confirmation`;
  }
  if (
    kind.includes("installment") &&
    (kind.includes("reminder") || kind.includes("overdue") || kind.includes("seller_message"))
  ) {
    return `/installment-payments`;
  }
  if (kind.includes("installment") && (kind.includes("seller") || kind.includes("early"))) {
    return `/installment-sales`;
  }
  if (kind.includes("installment_dispute")) {
    return `/installment-disputes`;
  }
  if (kind.includes("intro_ad") || kind.includes("seller_personal_category")) {
    return `/profile/advertising`;
  }
  if (kind.includes("raffle") && kind.includes("goal")) {
    return `/my-products`;
  }
  if (kind === "staff_broadcast") {
    return `/notifications`;
  }

  return `/notifications`;
}

/**
 * @param {unknown} subscription
 */
function normalizeSubscription(subscription) {
  const endpoint = String(subscription?.endpoint ?? "").trim();
  const p256dh = String(subscription?.keys?.p256dh ?? "").trim();
  const auth = String(subscription?.keys?.auth ?? "").trim();
  if (!endpoint || !p256dh || !auth) {
    return null;
  }
  const expirationTime =
    typeof subscription?.expirationTime === "number" && Number.isFinite(subscription.expirationTime)
      ? subscription.expirationTime
      : null;
  return { endpoint, keys: { p256dh, auth }, expirationTime };
}

/**
 * @param {string} userId
 * @param {unknown} subscription
 */
export async function registerWebPushSubscriptionForUser(userId, subscription) {
  const normalized = normalizeSubscription(subscription);
  if (!normalized) {
    throw new Error("Невалидная web-push подписка");
  }

  const user = await UserModel.findById(userId).select(
    "webPushSubscriptions notificationsEnabled",
  );
  if (!user) {
    throw new Error("Пользователь не найден");
  }

  const now = new Date();
  const existing = Array.isArray(user.webPushSubscriptions) ? [...user.webPushSubscriptions] : [];
  const withoutDuplicate = existing.filter((row) => row.endpoint !== normalized.endpoint);
  const nextRow = {
    endpoint: normalized.endpoint,
    keys: normalized.keys,
    expirationTime: normalized.expirationTime,
    updatedAt: now,
  };
  user.webPushSubscriptions = [nextRow, ...withoutDuplicate].slice(
    0,
    WEB_PUSH_SUBSCRIPTIONS_MAX_PER_USER,
  );
  // Явный opt-in на системный push → включить общий флаг уведомлений.
  user.notificationsEnabled = true;
  await user.save({ validateBeforeSave: false });
}

/**
 * @param {string} userId
 * @param {string} endpoint
 */
export async function removeWebPushSubscriptionForUser(userId, endpoint) {
  const normalizedEndpoint = String(endpoint ?? "").trim();
  if (!normalizedEndpoint) {
    return;
  }
  await UserModel.updateOne(
    { _id: userId },
    { $pull: { webPushSubscriptions: { endpoint: normalizedEndpoint } } },
  );
}

/**
 * @param {string} userId
 * @param {{ title?: string; body: string; url?: string; data?: Record<string, string> }} message
 */
export async function sendWebPushToUser(userId, message) {
  if (!ensureVapidConfigured()) {
    return;
  }

  const user = await UserModel.findById(userId)
    .select("webPushSubscriptions notificationsEnabled isBlockedUser isActiveUser")
    .lean();

  if (!user || user.isBlockedUser || user.isActiveUser === false) {
    return;
  }
  if (user.notificationsEnabled === false) {
    return;
  }

  const subscriptions = (user.webPushSubscriptions ?? [])
    .map((row) => normalizeSubscription(row))
    .filter(Boolean);

  if (subscriptions.length === 0) {
    return;
  }

  const payload = JSON.stringify({
    title: message.title ?? "Gitorg",
    body: message.body,
    url: message.url ?? "/notifications",
    data: message.data ?? {},
  });

  const invalidEndpoints = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload, {
          TTL: 60 * 60,
          urgency: "normal",
        });
      } catch (error) {
        const statusCode = error?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          invalidEndpoints.push(subscription.endpoint);
          return;
        }
        logServerEvent("error", {
          event: "sendwebpushtouser_one",
          statusCode: statusCode ?? null,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }),
  );

  if (invalidEndpoints.length > 0) {
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { webPushSubscriptions: { endpoint: { $in: invalidEndpoints } } } },
    );
  }
}
