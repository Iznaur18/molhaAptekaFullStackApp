import mongoose from "mongoose";

import { ReferralLedgerEntryModel, UserModel } from "../../models/index.js";
import {
  REFERRAL_CASHBACK_PERCENT,
  REFERRAL_LEDGER_ENTRY_CREDIT,
  REFERRAL_LEDGER_ENTRY_REVERSAL,
  REFERRAL_QUERY_PARAM,
} from "../../constants/referralConstants.js";
import { resolveFrontendOrigin } from "../../utils/resolveFrontendOrigin.js";
import { ensureUserReferralCode } from "./ensureUserReferralCode.js";

/**
 * @param {string} referralCode
 * @returns {string}
 */
export function buildReferralInviteUrl(referralCode) {
  const origin = resolveFrontendOrigin();
  return `${origin}/register?${REFERRAL_QUERY_PARAM}=${encodeURIComponent(referralCode)}`;
}

/**
 * Дашборд партнёрской программы для текущего пользователя.
 *
 * @param {string} userId
 */
export async function getMyReferralProgram(userId) {
  const referralCode = await ensureUserReferralCode(userId);
  const me = await UserModel.findById(userId).select("partnerBalance").lean();
  if (!me) {
    throw new Error("USER_NOT_FOUND");
  }

  const referrerObjectId = new mongoose.Types.ObjectId(String(userId));

  const referrals = await UserModel.find({ referredByUserId: referrerObjectId })
    .select("userName createdAt isActiveUser")
    .sort({ createdAt: -1 })
    .lean();

  const referralIds = referrals.map((row) => row._id);

  const spendAgg =
    referralIds.length === 0
      ? []
      : await ReferralLedgerEntryModel.aggregate([
          {
            $match: {
              referrerUserId: referrerObjectId,
              referredUserId: { $in: referralIds },
              entryType: {
                $in: [REFERRAL_LEDGER_ENTRY_CREDIT, REFERRAL_LEDGER_ENTRY_REVERSAL],
              },
            },
          },
          {
            $group: {
              _id: "$referredUserId",
              pointsSpent: {
                $sum: {
                  $cond: [
                    { $eq: ["$entryType", REFERRAL_LEDGER_ENTRY_CREDIT] },
                    "$pointsSpent",
                    { $multiply: ["$pointsSpent", -1] },
                  ],
                },
              },
              cashbackEarned: {
                $sum: {
                  $cond: [
                    { $eq: ["$entryType", REFERRAL_LEDGER_ENTRY_CREDIT] },
                    "$partnerAmount",
                    { $multiply: ["$partnerAmount", -1] },
                  ],
                },
              },
            },
          },
        ]);

  const spendByReferred = new Map(
    spendAgg.map((row) => [
      String(row._id),
      {
        pointsSpent: Math.max(0, Math.ceil(Number(row.pointsSpent) || 0)),
        cashbackEarned: Math.max(0, Math.ceil(Number(row.cashbackEarned) || 0)),
      },
    ]),
  );

  const referralRows = referrals.map((row) => {
    const stats = spendByReferred.get(String(row._id)) ?? {
      pointsSpent: 0,
      cashbackEarned: 0,
    };
    const isDeleted = row.isActiveUser === false;
    return {
      userId: String(row._id),
      userName: isDeleted ? "Удалённый аккаунт" : String(row.userName ?? ""),
      registeredAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      isDeleted,
      pointsSpentTotal: stats.pointsSpent,
      cashbackEarnedTotal: stats.cashbackEarned,
    };
  });

  const totalCashbackEarned = referralRows.reduce(
    (sum, row) => sum + row.cashbackEarnedTotal,
    0,
  );
  const totalReferralsSpend = referralRows.reduce(
    (sum, row) => sum + row.pointsSpentTotal,
    0,
  );

  return {
    referralCode,
    inviteUrl: buildReferralInviteUrl(referralCode),
    cashbackPercent: REFERRAL_CASHBACK_PERCENT,
    partnerBalance: Number(me.partnerBalance) || 0,
    totalReferrals: referralRows.length,
    totalReferralsSpend,
    totalCashbackEarned,
    referrals: referralRows,
  };
}
