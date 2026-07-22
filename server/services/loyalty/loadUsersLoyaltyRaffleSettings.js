import { USERS_LOYALTY_RAFFLE_SETTINGS_KEY } from "../../constants/usersLoyaltyRaffleSettingsConstants.js";
import { UsersLoyaltyRaffleSettingsModel } from "../../models/UsersLoyaltyRaffleSettingsModel.js";
import { resolveUsersLoyaltyRaffleSettingsPayload } from "./resolveUsersLoyaltyRaffleSettingsPayload.js";

export const loadUsersLoyaltyRaffleSettings = async () => {
  const row = await UsersLoyaltyRaffleSettingsModel.findOne({
    settingsKey: USERS_LOYALTY_RAFFLE_SETTINGS_KEY,
  }).lean();

  return resolveUsersLoyaltyRaffleSettingsPayload(row);
};
