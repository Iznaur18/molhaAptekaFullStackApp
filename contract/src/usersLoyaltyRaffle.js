import { z } from "zod";

/** Синхрон с `server/constants/usersLoyaltyRaffleSettingsConstants.js`. */
export const USERS_LOYALTY_RAFFLE_SETTINGS_KEY = "default";
export const USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH = 2000;
export const USERS_LOYALTY_RAFFLE_GOAL_MIN = 1;
export const USERS_LOYALTY_RAFFLE_GOAL_MAX = 10_000_000;
export const USERS_LOYALTY_RAFFLE_GOAL_DEFAULT = 50_000;

const optionalTrimmedDescription = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }
  if (value == null || String(value).trim() === "") {
    return "";
  }
  return String(value).trim();
}, z.string().max(USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH).optional());

export const usersLoyaltyRaffleSettingsSchema = z.object({
  description: z.string().max(USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH),
  goal: z
    .number()
    .int()
    .min(USERS_LOYALTY_RAFFLE_GOAL_MIN)
    .max(USERS_LOYALTY_RAFFLE_GOAL_MAX),
  updatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
});

export const usersLoyaltyRaffleSettingsDataSchema = z.object({
  settings: usersLoyaltyRaffleSettingsSchema,
});

export const patchUsersLoyaltyRaffleSettingsBodySchema = z
  .object({
    description: optionalTrimmedDescription,
    goal: z.coerce
      .number()
      .int()
      .min(USERS_LOYALTY_RAFFLE_GOAL_MIN)
      .max(USERS_LOYALTY_RAFFLE_GOAL_MAX)
      .optional(),
  })
  .refine(
    (body) => body.description !== undefined || body.goal !== undefined,
    { message: "Укажите description и/или goal" },
  );

export const usersMonthlyLoyaltyAwardedDataSchema = z.object({
  pointsAwarded: z.number().int().min(0),
  goal: z
    .number()
    .int()
    .min(USERS_LOYALTY_RAFFLE_GOAL_MIN)
    .max(USERS_LOYALTY_RAFFLE_GOAL_MAX),
  description: z.string().max(USERS_LOYALTY_RAFFLE_DESCRIPTION_MAX_LENGTH),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});
