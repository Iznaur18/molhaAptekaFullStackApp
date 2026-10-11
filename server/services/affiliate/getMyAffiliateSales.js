import mongoose from "mongoose";
import { AFFILIATE_SALES_LIST_LIMIT } from "@molha/api-contract";

import { AFFILIATE_LINE_STATUS_NONE } from "../../constants/affiliateConstants.js";
import { OrderModel, ProductModel, UserModel } from "../../models/index.js";

/**
 * Продажи продавца, в которых покупателя привёл партнёр.
 *
 * Продавец позиции берётся из снимка `sellerIdAtOrder`; у старых заказов снимка
 * нет, поэтому вторым условием идёт принадлежность товара продавцу.
 *
 * @param {{ userId: string }} input
 */
export async function getMyAffiliateSales({ userId }) {
  const sellerObjectId = new mongoose.Types.ObjectId(String(userId));
  const sellerProductIds = await ProductModel.find({ productSeller: sellerObjectId })
    .distinct("_id")
    .exec();
  const sellerProductIdSet = new Set(sellerProductIds.map((id) => String(id)));

  const affiliateLineMatch = { affiliateStatus: { $ne: AFFILIATE_LINE_STATUS_NONE } };
  const orders = await OrderModel.find({
    $or: [
      {
        items: {
          $elemMatch: { ...affiliateLineMatch, sellerIdAtOrder: sellerObjectId },
        },
      },
      {
        items: {
          $elemMatch: { ...affiliateLineMatch, productId: { $in: sellerProductIds } },
        },
      },
    ],
  })
    .select(
      "userBuyerId createdAt items._id items.productId items.sellerIdAtOrder items.productNameAtOrder items.affiliateReferrerUserId items.affiliateStatus items.affiliateAmount items.affiliatePercentUsed items.affiliatePaidAt",
    )
    .sort({ createdAt: -1 })
    .limit(AFFILIATE_SALES_LIST_LIMIT)
    .lean();

  const lines = [];
  for (const order of orders) {
    for (const item of Array.isArray(order.items) ? order.items : []) {
      const status = String(item?.affiliateStatus ?? AFFILIATE_LINE_STATUS_NONE);
      if (status === AFFILIATE_LINE_STATUS_NONE) continue;
      const isSellerLine = item.sellerIdAtOrder
        ? String(item.sellerIdAtOrder) === String(userId)
        : sellerProductIdSet.has(String(item.productId));
      if (!isSellerLine) continue;
      lines.push({ order, item, status });
    }
  }

  const userIds = [
    ...new Set(
      lines
        .flatMap(({ order, item }) => [order.userBuyerId, item.affiliateReferrerUserId])
        .filter(Boolean)
        .map((id) => String(id)),
    ),
  ];
  const users =
    userIds.length > 0
      ? await UserModel.find({ _id: { $in: userIds } })
          .select("userName")
          .lean()
      : [];
  const userNameById = new Map(
    users.map((row) => [String(row._id), String(row.userName ?? "").trim()]),
  );
  const nameOf = (id) => (id ? (userNameById.get(String(id)) ?? "") : "");

  return {
    rows: lines.slice(0, AFFILIATE_SALES_LIST_LIMIT).map(({ order, item, status }) => ({
      orderId: String(order._id),
      orderItemId: String(item._id),
      productName: String(item.productNameAtOrder ?? "").trim() || "Товар",
      partnerName: nameOf(item.affiliateReferrerUserId),
      buyerName: nameOf(order.userBuyerId),
      status,
      amount: Math.ceil(Number(item.affiliateAmount) || 0),
      percentUsed:
        item.affiliatePercentUsed == null
          ? null
          : Math.floor(Number(item.affiliatePercentUsed)),
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
      paidAt: item.affiliatePaidAt
        ? new Date(item.affiliatePaidAt).toISOString()
        : null,
    })),
  };
}
