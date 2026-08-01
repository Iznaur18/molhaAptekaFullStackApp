import mongoose from "mongoose";

import { ORDER_STATUS_PENDING } from "../../constants/orderConstants.js";
import { OrderModel } from "../../models/index.js";

/**
 * DB-side page of buyer order `_id`s: pending (denorm status) сверху, затем createdAt ↓.
 *
 * @param {{
 *   buyerUserId: string;
 *   skip: number;
 *   limit: number;
 * }} input
 * @returns {Promise<{ orderIds: import("mongoose").Types.ObjectId[]; total: number }>}
 */
export async function fetchMyOrdersPageIds({ buyerUserId, skip, limit }) {
  const buyerId = new mongoose.Types.ObjectId(String(buyerUserId));
  const pipeline = [
    { $match: { userBuyerId: buyerId } },
    {
      $addFields: {
        pendingRank: {
          $cond: [{ $eq: ["$status", ORDER_STATUS_PENDING] }, 0, 1],
        },
      },
    },
    { $sort: { pendingRank: 1, createdAt: -1 } },
    {
      $facet: {
        meta: [{ $count: "total" }],
        page: [{ $skip: skip }, { $limit: limit }, { $project: { _id: 1 } }],
      },
    },
  ];

  const [facet] = await OrderModel.aggregate(pipeline);
  const total = facet?.meta?.[0]?.total ?? 0;
  const orderIds = (facet?.page ?? []).map((row) => row._id);
  return { orderIds, total };
}
