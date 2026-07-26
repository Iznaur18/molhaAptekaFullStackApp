import {
  BUYER_PASSPORT_SHARE_TTL_DAYS_DEFAULT,
} from "../../constants/passportVaultConstants.js";
import { OrderModel } from "../../models/index.js";

/**
 * @returns {number}
 */
export function resolveBuyerPassportShareTtlDays() {
  const raw = Number(process.env.BUYER_PASSPORT_SHARE_TTL_DAYS);
  if (Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  return BUYER_PASSPORT_SHARE_TTL_DAYS_DEFAULT;
}

/**
 * Clears installment passport snapshots older than TTL (consentAt).
 * @returns {Promise<{ matchedCount: number; modifiedCount: number }>}
 */
export async function purgeExpiredBuyerPassportShares() {
  const ttlDays = resolveBuyerPassportShareTtlDays();
  const cutoff = new Date(Date.now() - ttlDays * 24 * 60 * 60 * 1000);

  const result = await OrderModel.updateMany(
    {
      buyerPassportShare: { $ne: null },
      passportShareConsentAt: { $ne: null, $lte: cutoff },
    },
    { $set: { buyerPassportShare: null } },
  );

  return {
    matchedCount: result.matchedCount ?? 0,
    modifiedCount: result.modifiedCount ?? 0,
  };
}
