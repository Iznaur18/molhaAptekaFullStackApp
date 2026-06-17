import mongoose from "mongoose";

import {
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
} from "../../constants/orderConstants.js";
import { OrderModel } from "../../models/index.js";

const SALE_COUNT_ITEM_STATUSES = [ORDER_STATUS_DELIVERED, ORDER_STATUS_CONFIRMED];

/**
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
  const rows = await OrderModel.aggregate([
    { $unwind: "$items" },
    {
      $match: {
        "items.status": { $in: SALE_COUNT_ITEM_STATUSES },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productDoc",
      },
    },
    { $unwind: "$productDoc" },
    {
      $match: {
        "productDoc.productSeller": { $in: objectIds },
      },
    },
    {
      $group: {
        _id: {
          sellerId: "$productDoc.productSeller",
          orderId: "$_id",
        },
        orderAmount: {
          $sum: {
            $multiply: ["$items.quantity", "$items.unitPriceAtOrder"],
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.sellerId",
        totalSalesAmount: { $sum: "$orderAmount" },
        totalSalesCount: { $sum: 1 },
      },
    },
  ]);

  return Object.fromEntries(
    rows.map((row) => [
      String(row._id),
      {
        totalSalesAmount: Number(row.totalSalesAmount) || 0,
        totalSalesCount: Number(row.totalSalesCount) || 0,
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
