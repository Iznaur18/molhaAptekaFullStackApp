import { UserVoteRatingModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import { deleteAllFollowsForUser } from "./userFollowHelpers.js";
import { deleteSellerProductsAndRelatedData } from "./deleteUserCascade.js";
import { cancelIntroAdCampaignsForAdvertiser } from "../intro-ad/introAdCampaignHelpers.js";
import { cancelSiteHeaderBannerCampaignsForAdvertiser } from "../site-header-banner-campaign/siteHeaderBannerCampaignHelpers.js";

import { PROFILE_DELETE_CASCADE_ERROR_MESSAGE } from "./updateProfileConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

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

  logServerEvent("info", {
    event: "delete_profile_cascade_products",
    targetUserId,
    deletedProductCount: cascadeSummary.deletedProductCount,
    updatedCarts: cascadeSummary.updatedCarts,
  });

  const deletedVotes = await UserVoteRatingModel.deleteMany({
    $or: [{ userVoter: targetUserId }, { userVoteTarget: targetUserId }],
  });
  logServerEvent("info", {
    event: "delete_profile_cascade_votes",
    targetUserId,
    deletedVotes: deletedVotes.deletedCount,
  });

  await deleteAllFollowsForUser(targetUserId);
  logServerEvent("info", {
    event: "delete_profile_cascade_follows",
    targetUserId,
  });

  try {
    await cancelIntroAdCampaignsForAdvertiser(String(targetUserId));
  } catch (introAdCancelError) {
    logServerEvent("error", {
      event: "cancelintroadcampaignsforadvertiser",
      error:
        introAdCancelError instanceof Error
          ? introAdCancelError.message
          : String(introAdCancelError),
    });
  }

  try {
    await cancelSiteHeaderBannerCampaignsForAdvertiser(String(targetUserId));
  } catch (bannerCancelError) {
    logServerEvent("error", {
      event: "cancelsiteheaderbannercampaignsforadvertiser",
      error:
        bannerCancelError instanceof Error
          ? bannerCancelError.message
          : String(bannerCancelError),
    });
  }

  return cascadeSummary;
}
