import { UserModel } from "../../models/index.js";
import { generateReferralCode } from "./generateReferralCode.js";

const MAX_CODE_ATTEMPTS = 12;

const unsetReferralCodeFilter = {
  $or: [
    { referralCode: null },
    { referralCode: { $exists: false } },
    { referralCode: "" },
  ],
};

/**
 * Гарантирует уникальный referralCode у пользователя.
 *
 * @param {string} userId
 * @param {import('mongoose').ClientSession | null} [session]
 * @returns {Promise<string>}
 */
export async function ensureUserReferralCode(userId, session = null) {
  const existingLookup = UserModel.findById(userId).select("referralCode");
  if (session) {
    existingLookup.session(session);
  }
  const existing = await existingLookup.lean();
  if (!existing) {
    throw new Error("USER_NOT_FOUND");
  }
  if (existing.referralCode) {
    return String(existing.referralCode);
  }

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = generateReferralCode();
    try {
      const updated = await UserModel.findOneAndUpdate(
        { _id: userId, ...unsetReferralCodeFilter },
        { $set: { referralCode: code } },
        {
          returnDocument: "after",
          session: session ?? undefined,
        },
      ).lean();

      if (updated?.referralCode) {
        return String(updated.referralCode);
      }

      const racedLookup = UserModel.findById(userId).select("referralCode");
      if (session) {
        racedLookup.session(session);
      }
      const raced = await racedLookup.lean();
      if (raced?.referralCode) {
        return String(raced.referralCode);
      }
    } catch (error) {
      if (error?.code !== 11000) {
        throw error;
      }
    }
  }

  throw new Error("REFERRAL_CODE_GENERATION_FAILED");
}
