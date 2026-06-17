import { UserVoteRatingModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import { deleteAllFollowsForUser } from "./userFollowHelpers.js";
import { deleteSellerProductsAndRelatedData } from "./deleteUserCascade.js";
import { cancelIntroAdCampaignsForAdvertiser } from "../intro-ad/introAdCampaignHelpers.js";

import { PROFILE_DELETE_CASCADE_ERROR_MESSAGE } from "./updateProfileConstants.js";

/**
 * @param {string} targetUserId
 */
export async function runProfileDeleteCascade(targetUserId) {
  let cascadeSummary = { deletedProductCount: 0, updatedCarts: 0 };

  try {
    cascadeSummary = await deleteSellerProductsAndRelatedData(targetUserId);
  } catch (cascadeError) {
    const statusCode =
      cascadeError &&
      typeof cascadeError === "object" &&
      "statusCode" in cascadeError &&
      cascadeError.statusCode === 409
        ? 409
        : 500;
    const message =
      cascadeError instanceof Error
        ? cascadeError.message
        : PROFILE_DELETE_CASCADE_ERROR_MESSAGE;
    throw new AppError(statusCode, message);
  }

  console.log(
    `[DELETE PROFILE] Deleted ${cascadeSummary.deletedProductCount} products, updated ${cascadeSummary.updatedCarts} carts for user ${targetUserId}`,
  );

  const deletedVotes = await UserVoteRatingModel.deleteMany({
    $or: [{ userVoter: targetUserId }, { userVoteTarget: targetUserId }],
  });
  console.log(
    `[DELETE PROFILE] Deleted ${deletedVotes.deletedCount} vote records for user ${targetUserId}`,
  );

  await deleteAllFollowsForUser(targetUserId);
  console.log(`[DELETE PROFILE] Deleted follow records for user ${targetUserId}`);

  try {
    await cancelIntroAdCampaignsForAdvertiser(String(targetUserId));
  } catch (introAdCancelError) {
    console.error("cancelIntroAdCampaignsForAdvertiser error:", introAdCancelError);
  }

  return cascadeSummary;
}
