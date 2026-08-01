import {
  AffiliateLedgerEntryModel,
  OrderModel,
  UserModel,
} from "../../models/index.js";
import { AFFILIATE_LEDGER_ENTRY_PAYOUT } from "../../constants/affiliateConstants.js";
import { migrateAffiliateBudgetToLoyaltyPoints } from "./migrateAffiliateBudgetToLoyaltyPoints.js";

/**
 * @param {import("mongoose").Types.ObjectId | string | null | undefined} orderId
 * @param {import("mongoose").Types.ObjectId | string | null | undefined} orderItemId
 * @param {Map<string, { productName: string; itemIndex: number }>} byItemId
 * @param {Map<string, Array<{ productName: string; itemIndex: number; affiliateReferrerUserId: string }>>} byOrderId
 * @param {string} affiliateUserId
 */
function resolvePayoutProductMeta(
  orderId,
  orderItemId,
  byItemId,
  byOrderId,
  affiliateUserId,
) {
  const itemKey = orderItemId ? String(orderItemId) : "";
  if (itemKey && byItemId.has(itemKey)) {
    return byItemId.get(itemKey);
  }
  const oid = orderId ? String(orderId) : "";
  if (!oid) {
    return null;
  }
  const candidates = byOrderId.get(oid) ?? [];
  const matched = candidates.find(
    (row) => row.affiliateReferrerUserId === affiliateUserId,
  );
  return matched ?? candidates[0] ?? null;
}

/**
 * @param {string} userId
 */
export async function getMyAffiliateEarnings(userId) {
  await migrateAffiliateBudgetToLoyaltyPoints(userId);

  const [user, payouts] = await Promise.all([
    UserModel.findById(userId).select("userLoyaltyPoints").lean(),
    AffiliateLedgerEntryModel.find({
      affiliateUserId: userId,
      entryType: AFFILIATE_LEDGER_ENTRY_PAYOUT,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
  ]);

  const orderIds = [
    ...new Set(
      payouts.map((row) => (row.orderId ? String(row.orderId) : "")).filter(Boolean),
    ),
  ];

  /** @type {Map<string, { productName: string; itemIndex: number }>} */
  const byItemId = new Map();
  /** @type {Map<string, Array<{ productName: string; itemIndex: number; affiliateReferrerUserId: string }>>} */
  const byOrderId = new Map();

  if (orderIds.length > 0) {
    const orders = await OrderModel.find({ _id: { $in: orderIds } })
      .select("items.productNameAtOrder items._id items.affiliateReferrerUserId")
      .lean();

    for (const order of orders) {
      const oid = String(order._id);
      const list = [];
      const items = Array.isArray(order.items) ? order.items : [];
      for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        const item = items[itemIndex];
        if (!item) continue;
        const productName = String(item.productNameAtOrder ?? "").trim();
        const meta = {
          productName: productName || "Товар",
          itemIndex,
          affiliateReferrerUserId: item.affiliateReferrerUserId
            ? String(item.affiliateReferrerUserId)
            : "",
        };
        list.push(meta);
        if (item._id) {
          byItemId.set(String(item._id), {
            productName: meta.productName,
            itemIndex: meta.itemIndex,
          });
        }
      }
      byOrderId.set(oid, list);
    }
  }

  return {
    loyaltyPointsBalance: Number(user?.userLoyaltyPoints) || 0,
    rows: payouts.map((row) => {
      const meta = resolvePayoutProductMeta(
        row.orderId,
        row.orderItemId,
        byItemId,
        byOrderId,
        String(userId),
      );
      return {
        orderId: row.orderId ? String(row.orderId) : "",
        itemIndex: meta?.itemIndex ?? 0,
        productName: meta?.productName ?? "",
        amount: Math.ceil(Number(row.amount) || 0),
        percentUsed:
          row.percentUsed == null ? null : Math.floor(Number(row.percentUsed)),
        status: "paid",
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
        paidAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
        sourceId: String(row.sourceId ?? ""),
      };
    }),
  };
}
