import { OrderModel } from "../../models/index.js";
import { resolveMoscowCalendarMonthUtcRange } from "./moscowCalendarMonth.js";
import { loadUsersLoyaltyRaffleSettings } from "./loadUsersLoyaltyRaffleSettings.js";

/**
 * Сумма баллов, начисленных покупателям при подтверждении заказов за календарный месяц (MSK).
 * @param {Date} [referenceDate]
 * @returns {Promise<{
 *   pointsAwarded: number;
 *   goal: number;
 *   description: string;
 *   year: number;
 *   month: number;
 * }>}
 */
export const getMonthlyLoyaltyPointsAwardedSummary = async (referenceDate = new Date()) => {
  const { startUtc, endUtc, year, month } = resolveMoscowCalendarMonthUtcRange(referenceDate);
  const settings = await loadUsersLoyaltyRaffleSettings();

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

  const pointsAwarded = Math.max(0, Math.floor(Number(rows[0]?.total) || 0));

  return {
    pointsAwarded,
    goal: settings.goal,
    description: settings.description,
    year,
    month,
  };
};
