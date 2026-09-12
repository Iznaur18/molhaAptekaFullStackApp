import { USERS_LOYALTY_RAFFLE_SETTINGS_KEY } from "../../constants/usersLoyaltyRaffleSettingsConstants.js";
import { UsersLoyaltyRaffleSettingsModel } from "../../models/UsersLoyaltyRaffleSettingsModel.js";
import { successRes } from "../../services/http/index.js";
import { getRawMonthlyLoyaltyPointsAwarded } from "../../services/loyalty/sumMonthlyLoyaltyPointsAwarded.js";
import { resolveUsersLoyaltyRaffleSettingsPayload } from "../../services/loyalty/resolveUsersLoyaltyRaffleSettingsPayload.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/** GET /users-loyalty-raffle */
export const getUsersLoyaltyRaffleSettingsController = async (_req, res) => {
  const row = await UsersLoyaltyRaffleSettingsModel.findOne({
    settingsKey: USERS_LOYALTY_RAFFLE_SETTINGS_KEY,
  }).lean();

  return successRes(res, {
    settings: resolveUsersLoyaltyRaffleSettingsPayload(row),
  });
};

/** PATCH /users-loyalty-raffle — только admin. */
export const patchUsersLoyaltyRaffleSettingsController = async (req, res) => {
  const body = req.body ?? {};
  /** @type {Record<string, unknown>} */
  const update = { updatedBy: req.userId };

  if (body.description !== undefined) {
    update.description =
      body.description == null ? "" : String(body.description).trim();
  }
  if (body.donationImageUrl !== undefined) {
    update.donationImageUrl =
      body.donationImageUrl == null ? "" : String(body.donationImageUrl).trim();
  }
  if (body.goal !== undefined) {
    update.goal = body.goal;
  }

  const saved = await UsersLoyaltyRaffleSettingsModel.findOneAndUpdate(
    { settingsKey: USERS_LOYALTY_RAFFLE_SETTINGS_KEY },
    { $set: update },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  return successRes(res, {
    settings: resolveUsersLoyaltyRaffleSettingsPayload(saved),
  });
};

/**
 * POST /users-loyalty-raffle/reset-progress — мягко обнулить сумму бара (admin).
 * Платежи и заказы не трогаем: запоминаем текущую сырую сумму как baseline месяца.
 */
export const resetUsersLoyaltyRaffleProgressController = async (req, res) => {
  const { rawPointsAwarded, year, month } = await getRawMonthlyLoyaltyPointsAwarded();

  const saved = await UsersLoyaltyRaffleSettingsModel.findOneAndUpdate(
    { settingsKey: USERS_LOYALTY_RAFFLE_SETTINGS_KEY },
    {
      $set: {
        progressBaseline: rawPointsAwarded,
        progressBaselineYear: year,
        progressBaselineMonth: month,
        updatedBy: req.userId,
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  logServerEvent("info", {
    event: "users_loyalty_raffle.progress_reset",
    userId: String(req.userId),
    progressBaseline: rawPointsAwarded,
    year,
    month,
  });

  return successRes(res, {
    settings: resolveUsersLoyaltyRaffleSettingsPayload(saved),
    pointsAwarded: 0,
    year,
    month,
  });
};
