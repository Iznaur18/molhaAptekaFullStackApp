import { REFERRAL_CODE_PATTERN } from "../../constants/referralConstants.js";
import { UserModel } from "../../models/index.js";

/**
 * Резолв `?aff=` / affiliateCode → userId. Невалидный код → null.
 *
 * @param {string | null | undefined} affiliateCode
 * @returns {Promise<string | null>}
 */
export async function resolveAffiliateReferrerUserId(affiliateCode) {
  const code = String(affiliateCode ?? "")
    .trim()
    .toUpperCase();
  if (!code || !REFERRAL_CODE_PATTERN.test(code)) {
    return null;
  }

  const user = await UserModel.findOne({ referralCode: code })
    .select("_id")
    .lean();
  return user?._id ? String(user._id) : null;
}

/**
 * @param {{
 *   referrerUserId: string | null;
 *   buyerUserId: string;
 *   sellerUserId: string;
 *   affiliateEnabled: boolean;
 *   affiliatePercent: number;
 * }} input
 */
export function resolveOrderLineAffiliateAttribution({
  referrerUserId,
  buyerUserId,
  sellerUserId,
  affiliateEnabled,
  affiliatePercent,
}) {
  if (!referrerUserId) {
    return { affiliateReferrerUserId: null, affiliateStatus: "none" };
  }
  if (affiliateEnabled !== true || Math.floor(Number(affiliatePercent) || 0) <= 0) {
    return { affiliateReferrerUserId: null, affiliateStatus: "none" };
  }
  if (
    referrerUserId === buyerUserId ||
    referrerUserId === sellerUserId
  ) {
    return { affiliateReferrerUserId: null, affiliateStatus: "none" };
  }
  return {
    affiliateReferrerUserId: referrerUserId,
    affiliateStatus: "pending",
  };
}
