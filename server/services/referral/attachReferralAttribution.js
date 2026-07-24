import { UserModel } from "../../models/index.js";
import {
  REFERRAL_CODE_PATTERN,
  REFERRAL_INVALID_CODE_MESSAGE,
} from "../../constants/referralConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Привязывает реферала к рефереру один раз при регистрации.
 * Невалидный / свой / несуществующий код — тихий no-op (регистрация не падает).
 *
 * @param {{
 *   userId: string;
 *   referralCode?: string | null;
 * }} params
 */
export async function attachReferralAttribution({ userId, referralCode }) {
  const normalized = String(referralCode ?? "")
    .trim()
    .toUpperCase();
  if (!normalized) {
    return { attached: false };
  }
  if (!REFERRAL_CODE_PATTERN.test(normalized)) {
    logServerEvent("info", {
      event: "referral_attribution_skipped",
      reason: "invalid_code",
      userId: String(userId),
    });
    return { attached: false, reason: REFERRAL_INVALID_CODE_MESSAGE };
  }

  const referrer = await UserModel.findOne({ referralCode: normalized })
    .select("_id")
    .lean();
  if (!referrer) {
    logServerEvent("info", {
      event: "referral_attribution_skipped",
      reason: "code_not_found",
      userId: String(userId),
    });
    return { attached: false };
  }

  if (String(referrer._id) === String(userId)) {
    return { attached: false };
  }

  const updated = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      $or: [{ referredByUserId: null }, { referredByUserId: { $exists: false } }],
    },
    { $set: { referredByUserId: referrer._id } },
    { returnDocument: "after" },
  ).lean();

  if (!updated) {
    return { attached: false };
  }

  logServerEvent("info", {
    event: "referral_attribution_attached",
    userId: String(userId),
    referrerUserId: String(referrer._id),
  });

  return { attached: true, referrerUserId: String(referrer._id) };
}
