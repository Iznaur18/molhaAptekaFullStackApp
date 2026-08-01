import { UserModel } from "../../models/index.js";
import { migratePartnerBalanceToLoyaltyPoints } from "../../services/referral/migratePartnerBalanceToLoyaltyPoints.js";

/**
 * Bulk: все users с partnerBalance > 0 → loyalty 1:1.
 */
export async function up() {
  const users = await UserModel.find({ partnerBalance: { $gt: 0 } })
    .select("_id")
    .lean();

  let migrated = 0;
  let points = 0;
  for (const row of users) {
    const amount = await migratePartnerBalanceToLoyaltyPoints(String(row._id));
    if (amount > 0) {
      migrated += 1;
      points += amount;
    }
  }

  return { migratedUsers: migrated, pointsMoved: points };
}
