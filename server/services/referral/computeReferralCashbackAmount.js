import { REFERRAL_CASHBACK_PERCENT } from "../../constants/referralConstants.js";

/**
 * @param {number} pointsSpent
 * @returns {number}
 */
export function computeReferralCashbackAmount(pointsSpent) {
  const spent = Math.ceil(Number(pointsSpent) || 0);
  if (spent <= 0) {
    return 0;
  }
  return Math.floor((spent * REFERRAL_CASHBACK_PERCENT) / 100);
}
