import { UserModel } from "../models/index.js";

/**
 * @returns {Promise<import('mongoose').Types.ObjectId[]>}
 */
export async function getConfirmedSellerIds() {
  const rows = await UserModel.find({
    isUserDataConfirmed: true,
    isBlockedUser: { $ne: true },
    isActiveUser: { $ne: false },
  })
    .select("_id")
    .lean();

  return rows.map((row) => row._id);
}
