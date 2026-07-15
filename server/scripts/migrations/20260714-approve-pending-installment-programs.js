import {
  INSTALLMENT_MODERATION_APPROVED,
  INSTALLMENT_MODERATION_PENDING,
} from "../../constants/installmentConstants.js";

/**
 * Auto-approve pending installment programs (staff moderation removed).
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const programs = db.collection("productinstallmentprograms");
  const products = db.collection("products");

  const pendingFilter = {
    moderationStatus: INSTALLMENT_MODERATION_PENDING,
    isEnabled: true,
  };

  const matched = await programs.countDocuments(pendingFilter);

  if (!isApply) {
    return { matched, wouldMigrate: matched };
  }

  const result = await programs.updateMany(pendingFilter, {
    $set: {
      moderationStatus: INSTALLMENT_MODERATION_APPROVED,
      moderationComment: "",
      wasEverApproved: true,
    },
  });

  const enabledPrograms = await programs
    .find({
      isEnabled: true,
      moderationStatus: INSTALLMENT_MODERATION_APPROVED,
      "plans.0": { $exists: true },
    })
    .project({ productId: 1 })
    .toArray();

  const productIds = enabledPrograms.map((row) => row.productId).filter(Boolean);

  let productsSynced = 0;
  if (productIds.length > 0) {
    const syncResult = await products.updateMany(
      { _id: { $in: productIds } },
      { $set: { productInstallmentEnabled: true } },
    );
    productsSynced = syncResult.modifiedCount;
  }

  return {
    matched,
    modified: result.modifiedCount,
    productsSynced,
  };
}
