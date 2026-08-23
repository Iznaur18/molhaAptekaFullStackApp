import {
  IN_APP_NOTIFICATION_KIND_SELLER_NEW_ORDER,
  IN_APP_NOTIFICATION_MESSAGE_SELLER_NEW_ORDER,
} from "../../constants/orderConstants.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

/**
 * @param {unknown} raw
 * @returns {string}
 */
const resolveLineProductId = (raw) => {
  const nested = raw?.productId?._id ?? raw?.productId;
  return nested ? String(nested) : "";
};

/**
 * @param {{
 *   items: Array<{ productId?: unknown; productNameAtOrder?: string }>;
 *   productById: Record<string, { sellerId: string; name: string }>;
 *   buyerUserId: string;
 * }} input
 * @returns {Map<string, { lineCount: number; names: string[] }>}
 */
export const groupNewOrderLinesBySeller = ({ items, productById, buyerUserId }) => {
  /** @type {Map<string, { lineCount: number; names: string[] }>} */
  const bySeller = new Map();
  const buyerId = String(buyerUserId);

  for (const item of items ?? []) {
    const productId = resolveLineProductId(item);
    if (!productId) {
      continue;
    }

    const snapshot = productById[productId];
    const sellerId = snapshot?.sellerId ? String(snapshot.sellerId) : "";
    if (!sellerId || sellerId === buyerId) {
      continue;
    }

    const bucket = bySeller.get(sellerId) ?? { lineCount: 0, names: [] };
    bucket.lineCount += 1;
    const name = String(item.productNameAtOrder ?? snapshot?.name ?? "").trim();
    if (name && !bucket.names.includes(name)) {
      bucket.names.push(name);
    }
    bySeller.set(sellerId, bucket);
  }

  return bySeller;
};

/**
 * @param {{ lineCount: number; names: string[] }} bucket
 * @returns {string}
 */
export const buildSellerNewOrderNotificationMessage = (bucket) => {
  if (bucket.lineCount === 1 && bucket.names[0]) {
    return `${IN_APP_NOTIFICATION_MESSAGE_SELLER_NEW_ORDER}: ${bucket.names[0]}`;
  }
  if (bucket.lineCount > 1) {
    return `${IN_APP_NOTIFICATION_MESSAGE_SELLER_NEW_ORDER}: ${bucket.lineCount} поз.`;
  }
  return IN_APP_NOTIFICATION_MESSAGE_SELLER_NEW_ORDER;
};

/**
 * @param {{
 *   order: { items?: Array<{ productId?: unknown; productNameAtOrder?: string }> };
 *   buyerUserId: string;
 *   productById: Record<string, { sellerId: string; name: string }>;
 * }} params
 */
export async function notifySellersAboutNewOrder({ order, buyerUserId, productById }) {
  const bySeller = groupNewOrderLinesBySeller({
    items: order.items ?? [],
    productById,
    buyerUserId,
  });

  await Promise.all(
    [...bySeller.entries()].map(async ([sellerUserId, bucket]) => {
      await createUserInAppNotification({
        userId: sellerUserId,
        kind: IN_APP_NOTIFICATION_KIND_SELLER_NEW_ORDER,
        message: buildSellerNewOrderNotificationMessage(bucket),
        actorUserId: buyerUserId,
      });
    }),
  );
}
