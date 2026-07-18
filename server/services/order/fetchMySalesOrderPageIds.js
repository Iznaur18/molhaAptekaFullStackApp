import { OrderModel } from "../../models/index.js";

import {
  buildMySalesSortStage,
  buildSellerItemsPendingFirstAddFieldsStage,
} from "./buildSellerItemsPendingFirstSort.js";

/**
 * Страница `_id` продаж с опциональным приоритетом «В обработке».
 *
 * @param {{
 *   query: Record<string, unknown>;
 *   sellerProductIds: import("mongoose").Types.ObjectId[];
 *   pendingFirst: boolean;
 *   skip: number;
 *   limit: number;
 * }} input
 * @returns {Promise<{ orderIds: import("mongoose").Types.ObjectId[]; total: number }>}
 */
export async function fetchMySalesOrderPageIds({
  query,
  sellerProductIds,
  pendingFirst,
  skip,
  limit,
}) {
  const pipeline = [
    { $match: query },
    ...(pendingFirst
      ? [buildSellerItemsPendingFirstAddFieldsStage(sellerProductIds)]
      : []),
    buildMySalesSortStage(pendingFirst),
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

/**
 * @template {{ _id: unknown }} T
 * @param {import("mongoose").Types.ObjectId[]} orderIds
 * @param {T[]} rows
 * @returns {T[]}
 */
export function orderRowsByIds(orderIds, rows) {
  const byId = new Map(rows.map((row) => [String(row._id), row]));
  return orderIds
    .map((id) => byId.get(String(id)))
    .filter((row) => row != null);
}
