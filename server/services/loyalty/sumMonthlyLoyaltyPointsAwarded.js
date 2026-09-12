import { OrderModel } from "../../models/index.js";
import { resolveMoscowCalendarMonthUtcRange } from "./moscowCalendarMonth.js";
import { loadUsersLoyaltyRaffleSettings } from "./loadUsersLoyaltyRaffleSettings.js";
import { sumUsersMonthlyDonationsInRange } from "../payments/usersMonthlyDonation.js";
import { applyMonthlyProgressBaseline } from "./resolveUsersLoyaltyRaffleSettingsPayload.js";

/**
 * @param {{ startUtc: Date; endUtc: Date }} range
 * @returns {Promise<number>}
 */
export const sumMonthlyLoyaltyPointsFromOrders = async ({ startUtc, endUtc }) => {
  const rows = await OrderModel.aggregate([
    {
      $match: {
        items: {
          $elemMatch: {
            loyaltyPointsAwarded: true,
            confirmedAt: { $gte: startUtc, $lt: endUtc },
          },
        },
      },
    },
    { $unwind: "$items" },
    {
      $match: {
        "items.loyaltyPointsAwarded": true,
        "items.confirmedAt": { $gte: startUtc, $lt: endUtc },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $ifNull: ["$items.loyaltyPointsEarned", 0] } },
      },
    },
  ]);

  return Math.max(0, Math.floor(Number(rows[0]?.total) || 0));
};

/**
 * Сырая сумма (заказы + донаты) без baseline.
 * @param {Date} [referenceDate]
 * @returns {Promise<{ rawPointsAwarded: number; year: number; month: number; startUtc: Date; endUtc: Date }>}
 */
export const getRawMonthlyLoyaltyPointsAwarded = async (referenceDate = new Date()) => {
  const { startUtc, endUtc, year, month } =
    resolveMoscowCalendarMonthUtcRange(referenceDate);
  const pointsFromOrders = await sumMonthlyLoyaltyPointsFromOrders({
    startUtc,
    endUtc,
  });
  const donatedRub = await sumUsersMonthlyDonationsInRange({ startUtc, endUtc });
  return {
    rawPointsAwarded: pointsFromOrders + donatedRub,
    year,
    month,
    startUtc,
    endUtc,
  };
};

/**
 * Сумма баллов с заказов + пожертвований (1 ₽ = +1) за календарный месяц (MSK),
 * минус мягкий admin-baseline текущего месяца.
 * @param {Date} [referenceDate]
 * @returns {Promise<{
 *   pointsAwarded: number;
 *   goal: number;
 *   description: string;
 *   year: number;
 *   month: number;
 * }>}
 */
export const getMonthlyLoyaltyPointsAwardedSummary = async (
  referenceDate = new Date(),
) => {
  const settings = await loadUsersLoyaltyRaffleSettings();
  const { rawPointsAwarded, year, month } =
    await getRawMonthlyLoyaltyPointsAwarded(referenceDate);
  const pointsAwarded = applyMonthlyProgressBaseline(
    rawPointsAwarded,
    settings,
    year,
    month,
  );

  return {
    pointsAwarded,
    goal: settings.goal,
    description: settings.description,
    year,
    month,
  };
};
