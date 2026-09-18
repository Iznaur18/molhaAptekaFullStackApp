import mongoose from "mongoose";

import {
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
} from "../../constants/orderConstants.js";
import { OrderModel, UserFollowModel } from "../../models/index.js";
import { getSellerCommerceStatsBySellerIds } from "../order/sellerTotalSalesAmount.js";
import { getUserFollowCounts } from "./userFollowHelpers.js";
import {
  STATS_TREND_BUCKET_COUNT,
  STATS_TREND_WINDOW_HOURS,
  STATS_TREND_WINDOW_MS,
  buildStatsTrendSeries,
} from "./statsTrendMath.js";

const SALE_STATUSES = [ORDER_STATUS_DELIVERED, ORDER_STATUS_CONFIRMED];

/**
 * @param {string} userId
 * @param {number} windowStartMs
 * @returns {Promise<number[]>}
 */
async function listFollowerEventTimestampsMs(userId, windowStartMs) {
  const rows = await UserFollowModel.find({
    followingId: userId,
    createdAt: { $gte: new Date(windowStartMs) },
  })
    .select("createdAt")
    .lean();

  return rows
    .map((row) => new Date(row.createdAt).getTime())
    .filter((ts) => Number.isFinite(ts));
}

/**
 * Моменты, когда позиция продавца стала confirmed/delivered (за окно).
 * Считаем уникальные orderId — как totalSalesCount.
 *
 * @param {string} sellerId
 * @param {number} windowStartMs
 * @returns {Promise<number[]>}
 */
async function listSaleEventTimestampsMs(sellerId, windowStartMs) {
  const sellerOid = new mongoose.Types.ObjectId(sellerId);
  const windowStart = new Date(windowStartMs);

  const rows = await OrderModel.aggregate([
    {
      $match: {
        items: {
          $elemMatch: {
            sellerIdAtOrder: sellerOid,
            status: { $in: SALE_STATUSES },
          },
        },
      },
    },
    { $unwind: "$items" },
    {
      $match: {
        "items.sellerIdAtOrder": sellerOid,
        "items.status": { $in: SALE_STATUSES },
      },
    },
    {
      $project: {
        orderId: "$_id",
        eventAt: {
          $ifNull: [
            "$items.confirmedAt",
            { $ifNull: ["$items.deliveredAt", "$createdAt"] },
          ],
        },
      },
    },
    {
      $match: {
        eventAt: { $gte: windowStart },
      },
    },
    {
      $group: {
        _id: "$orderId",
        eventAt: { $min: "$eventAt" },
      },
    },
  ]);

  return rows
    .map((row) => new Date(row.eventAt).getTime())
    .filter((ts) => Number.isFinite(ts));
}

/**
 * Тренды за 24ч для карточек своего профиля.
 *
 * @param {string} userId
 */
export async function getMyStatsTrends(userId) {
  const nowMs = Date.now();
  const windowStartMs = nowMs - STATS_TREND_WINDOW_MS;

  const [followCounts, commerceBySeller, followerEvents, saleEvents] =
    await Promise.all([
      getUserFollowCounts(userId),
      getSellerCommerceStatsBySellerIds([userId]),
      listFollowerEventTimestampsMs(userId, windowStartMs),
      listSaleEventTimestampsMs(userId, windowStartMs),
    ]);

  const salesCurrent = commerceBySeller[userId]?.totalSalesCount ?? 0;

  const followers = buildStatsTrendSeries({
    currentTotal: followCounts.followersCount,
    eventTimestampsMs: followerEvents,
    nowMs,
    windowMs: STATS_TREND_WINDOW_MS,
    bucketCount: STATS_TREND_BUCKET_COUNT,
  });

  const sales = buildStatsTrendSeries({
    currentTotal: salesCurrent,
    eventTimestampsMs: saleEvents,
    nowMs,
    windowMs: STATS_TREND_WINDOW_MS,
    bucketCount: STATS_TREND_BUCKET_COUNT,
  });

  return {
    windowHours: STATS_TREND_WINDOW_HOURS,
    bucketCount: STATS_TREND_BUCKET_COUNT,
    followers: {
      percentChange: followers.percentChange,
      series: followers.series,
    },
    sales: {
      percentChange: sales.percentChange,
      series: sales.series,
    },
  };
}
