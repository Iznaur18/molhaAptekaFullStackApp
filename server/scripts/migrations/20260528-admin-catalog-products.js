import { ADMIN_ROLE } from "../../services/access/adminUserGuard.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";

/**
 * Товары админов: в каталоге (approved + productIsAvailable).
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const users = db.collection("users");
  const products = db.collection("products");

  const adminRows = await users
    .find({ userRole: ADMIN_ROLE })
    .project({ _id: 1 })
    .toArray();
  const adminIds = adminRows.map((row) => row._id);

  if (adminIds.length === 0) {
    return { adminUsers: 0, matched: 0, modified: 0 };
  }

  const productFilter = {
    productSeller: { $in: adminIds },
    $or: [
      { productModerationStatus: { $ne: PRODUCT_MODERATION_APPROVED } },
      { productIsAvailable: false },
    ],
  };

  const matched = await products.countDocuments(productFilter);

  if (!isApply) {
    return { adminUsers: adminIds.length, matched, wouldMigrate: matched };
  }

  const [userResult, productResult] = await Promise.all([
    users.updateMany(
      { userRole: ADMIN_ROLE, isActiveUser: false },
      { $set: { isActiveUser: true } },
    ),
    products.updateMany(productFilter, {
      $set: {
        productModerationStatus: PRODUCT_MODERATION_APPROVED,
        productModerationComment: "",
        productIsAvailable: true,
      },
    }),
  ]);

  return {
    adminUsers: adminIds.length,
    matched,
    modified: productResult.modifiedCount,
    adminsActivated: userResult.modifiedCount,
  };
}
