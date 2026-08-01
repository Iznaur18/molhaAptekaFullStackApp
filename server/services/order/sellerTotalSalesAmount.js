import mongoose from "mongoose";

import {
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
} from "../../constants/orderConstants.js";
import { OrderModel, ProductModel } from "../../models/index.js";

const SALE_COUNT_ITEM_STATUSES = [ORDER_STATUS_DELIVERED, ORDER_STATUS_CONFIRMED];

/**
 * Статистика продаж по sellerIds без full-collection $unwind:
 * сначала товары продавцов → $match по productId → unwind только кандидатов.
 *
 * @param {string[]} sellerIds
 * @returns {Promise<Record<string, { totalSalesAmount: number; totalSalesCount: number }>>}
 */
export const getSellerCommerceStatsBySellerIds = async (sellerIds) => {
  const ids = [
    ...new Set(
      sellerIds.map((id) => String(id)).filter((id) => mongoose.isValidObjectId(id)),
    ),
  ];

  if (ids.length === 0) {
    return {};
  }

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const sellerProducts = await ProductModel.find({ productSeller: { $in: objectIds } })
    .select("_id productSeller")
    .lean();

  if (sellerProducts.length === 0) {
    return Object.fromEntries(
      ids.map((id) => [id, { totalSalesAmount: 0, totalSalesCount: 0 }]),
    );
  }

  const productIds = sellerProducts.map((product) => product._id);
  const sellerByProductId = new Map(
    sellerProducts.map((product) => [
      String(product._id),
      String(product.productSeller),
    ]),
  );

  const rows = await OrderModel.aggregate([
    {
      $match: {
        items: {
          $elemMatch: {
            productId: { $in: productIds },
            status: { $in: SALE_COUNT_ITEM_STATUSES },
          },
        },
      },
    },
    { $unwind: "$items" },
    {
      $match: {
        "items.productId": { $in: productIds },
        "items.status": { $in: SALE_COUNT_ITEM_STATUSES },
      },
    },
    {
      $group: {
        _id: {
          productId: "$items.productId",
          orderId: "$_id",
        },
        orderAmount: {
          $sum: {
            $multiply: ["$items.quantity", "$items.unitPriceAtOrder"],
          },
        },
      },
    },
  ]);

  /** @type {Record<string, { totalSalesAmount: number; orderIds: Set<string> }>} */
  const acc = Object.fromEntries(
    ids.map((id) => [id, { totalSalesAmount: 0, orderIds: new Set() }]),
  );

  for (const row of rows) {
    const productId = String(row._id.productId ?? "");
    const sellerId = sellerByProductId.get(productId);
    if (!sellerId || !acc[sellerId]) {
      continue;
    }
    const orderId = String(row._id.orderId ?? "");
    acc[sellerId].totalSalesAmount += Number(row.orderAmount) || 0;
    if (orderId) {
      acc[sellerId].orderIds.add(orderId);
    }
  }

  return Object.fromEntries(
    Object.entries(acc).map(([sellerId, stats]) => [
      sellerId,
      {
        totalSalesAmount: stats.totalSalesAmount,
        totalSalesCount: stats.orderIds.size,
      },
    ]),
  );
};

/**
 * @param {string[]} sellerIds
 * @returns {Promise<Record<string, number>>}
 */
export const getTotalSalesAmountBySellerIds = async (sellerIds) => {
  const statsBySeller = await getSellerCommerceStatsBySellerIds(sellerIds);

  return Object.fromEntries(
    Object.entries(statsBySeller).map(([sellerId, stats]) => [
      sellerId,
      stats.totalSalesAmount,
    ]),
  );
};

/**
 * @param {Record<string, unknown>[]} users
 */
export const attachTotalSalesAmountToUsers = async (users) => {
  if (!Array.isArray(users) || users.length === 0) {
    return users;
  }

  const statsBySeller = await getSellerCommerceStatsBySellerIds(
    users.map((user) => String(user._id)),
  );

  return users.map((user) => {
    const stats = statsBySeller[String(user._id)];

    return {
      ...user,
      totalSalesAmount: stats?.totalSalesAmount ?? 0,
      totalSalesCount: stats?.totalSalesCount ?? 0,
    };
  });
};

/**
 * @param {Record<string, unknown> | null | undefined} user
 */
export const attachSellerCommerceStatsToUser = async (user) => {
  if (!user || user._id == null) {
    return user;
  }

  const [withStats] = await attachTotalSalesAmountToUsers([user]);
  return withStats;
};
