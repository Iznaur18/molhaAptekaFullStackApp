import {
  USERS_LOYALTY_RAFFLE_GOAL_DEFAULT,
  USERS_LOYALTY_RAFFLE_GOAL_MAX,
  USERS_LOYALTY_RAFFLE_GOAL_MIN,
} from "../../constants/usersLoyaltyRaffleSettingsConstants.js";

/**
 * @param {Record<string, unknown> | null | undefined} row
 * @returns {{ description: string; goal: number; updatedAt: Date | null }}
 */
export const resolveUsersLoyaltyRaffleSettingsPayload = (row) => {
  const rawDescription =
    row?.description == null ? "" : String(row.description).trim();
  const parsedGoal = Math.floor(Number(row?.goal));
  const goal =
    Number.isFinite(parsedGoal) &&
    parsedGoal >= USERS_LOYALTY_RAFFLE_GOAL_MIN &&
    parsedGoal <= USERS_LOYALTY_RAFFLE_GOAL_MAX
      ? parsedGoal
      : USERS_LOYALTY_RAFFLE_GOAL_DEFAULT;

  return {
    description: rawDescription,
    goal,
    updatedAt: row?.updatedAt instanceof Date ? row.updatedAt : row?.updatedAt ?? null,
  };
};
