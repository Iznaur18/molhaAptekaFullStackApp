import {
  USERS_LOYALTY_RAFFLE_DONATION_IMAGE_URL_MAX_LENGTH,
  USERS_LOYALTY_RAFFLE_GOAL_DEFAULT,
  USERS_LOYALTY_RAFFLE_GOAL_MAX,
  USERS_LOYALTY_RAFFLE_GOAL_MIN,
} from "../../constants/usersLoyaltyRaffleSettingsConstants.js";

/**
 * @param {unknown} value
 * @returns {number | null}
 */
const toOptionalInt = (value) => {
  if (value == null || value === "") {
    return null;
  }
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * @param {Record<string, unknown> | null | undefined} row
 * @returns {{
 *   description: string;
 *   donationImageUrl: string;
 *   goal: number;
 *   progressBaseline: number;
 *   progressBaselineYear: number | null;
 *   progressBaselineMonth: number | null;
 *   updatedAt: Date | null;
 * }}
 */
export const resolveUsersLoyaltyRaffleSettingsPayload = (row) => {
  const rawDescription = row?.description == null ? "" : String(row.description).trim();
  const rawDonationImageUrl =
    row?.donationImageUrl == null ? "" : String(row.donationImageUrl).trim();
  const donationImageUrl =
    rawDonationImageUrl.length > USERS_LOYALTY_RAFFLE_DONATION_IMAGE_URL_MAX_LENGTH
      ? rawDonationImageUrl.slice(0, USERS_LOYALTY_RAFFLE_DONATION_IMAGE_URL_MAX_LENGTH)
      : rawDonationImageUrl;
  const parsedGoal = Math.floor(Number(row?.goal));
  const goal =
    Number.isFinite(parsedGoal) &&
    parsedGoal >= USERS_LOYALTY_RAFFLE_GOAL_MIN &&
    parsedGoal <= USERS_LOYALTY_RAFFLE_GOAL_MAX
      ? parsedGoal
      : USERS_LOYALTY_RAFFLE_GOAL_DEFAULT;

  const parsedBaseline = Math.floor(Number(row?.progressBaseline));
  const progressBaseline =
    Number.isFinite(parsedBaseline) && parsedBaseline > 0 ? parsedBaseline : 0;
  const progressBaselineYear = toOptionalInt(row?.progressBaselineYear);
  const progressBaselineMonth = toOptionalInt(row?.progressBaselineMonth);
  const monthOk =
    progressBaselineMonth != null &&
    progressBaselineMonth >= 1 &&
    progressBaselineMonth <= 12;

  return {
    description: rawDescription,
    donationImageUrl,
    goal,
    progressBaseline,
    progressBaselineYear:
      progressBaselineYear != null && progressBaselineYear >= 2000
        ? progressBaselineYear
        : null,
    progressBaselineMonth: monthOk ? progressBaselineMonth : null,
    updatedAt:
      row?.updatedAt instanceof Date ? row.updatedAt : (row?.updatedAt ?? null),
  };
};

/**
 * Мягкий сброс: из сырой суммы вычитаем baseline текущего месяца.
 * @param {number} rawPoints
 * @param {{
 *   progressBaseline?: number;
 *   progressBaselineYear?: number | null;
 *   progressBaselineMonth?: number | null;
 * }} settings
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
export const applyMonthlyProgressBaseline = (
  rawPoints,
  settings,
  year,
  month,
) => {
  const safeRaw = Math.max(0, Math.floor(Number(rawPoints) || 0));
  const baseline = Math.max(0, Math.floor(Number(settings?.progressBaseline) || 0));
  const baselineYear = Math.floor(Number(settings?.progressBaselineYear));
  const baselineMonth = Math.floor(Number(settings?.progressBaselineMonth));
  if (
    !Number.isFinite(baselineYear) ||
    !Number.isFinite(baselineMonth) ||
    baselineYear !== year ||
    baselineMonth !== month ||
    baseline <= 0
  ) {
    return safeRaw;
  }
  return Math.max(0, safeRaw - baseline);
};
