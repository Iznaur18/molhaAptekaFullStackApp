import { rejectPendingDataConfirmationForUser } from "./userDataConfirmationHelpers.js";
import { cancelIntroAdCampaignsForAdvertiser } from "../intro-ad/introAdCampaignHelpers.js";
import { isPremiumActive, notifyPremiumRevokedByStaff } from "./premiumAccess.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * @param {{
 *   targetUserId: string;
 *   currentUserId: string;
 *   updateData: Record<string, unknown>;
 *   targetUserBeforeUpdate: Record<string, unknown>;
 *   isCurrentUserStaff: boolean;
 *   isCurrentUserOwner: boolean;
 *   wasPremium: boolean;
 * }} input
 */
export async function runProfileUpdateBeforeSave({
  targetUserId,
  currentUserId,
  updateData,
  targetUserBeforeUpdate,
  isCurrentUserStaff,
}) {
  const wasDataConfirmed = Boolean(targetUserBeforeUpdate.isUserDataConfirmed);
  const nextDataConfirmed =
    updateData.isUserDataConfirmed !== undefined
      ? Boolean(updateData.isUserDataConfirmed)
      : wasDataConfirmed;

  if (!wasDataConfirmed || nextDataConfirmed) {
    return;
  }

  try {
    await rejectPendingDataConfirmationForUser(
      targetUserId,
      undefined,
      isCurrentUserStaff ? currentUserId : null,
    );
  } catch (rejectError) {
    logServerEvent("error", {
      event: "rejectpendingdataconfirmationforuser",
      error: rejectError instanceof Error ? rejectError.message : String(rejectError),
    });
  }
}

/**
 * @param {{
 *   targetUserId: string;
 *   updateData: Record<string, unknown>;
 *   targetUserBeforeUpdate: Record<string, unknown>;
 *   userDataUpdated: Record<string, unknown>;
 *   isCurrentUserStaff: boolean;
 *   isCurrentUserOwner: boolean;
 *   wasPremium: boolean;
 * }} input
 */
export async function runProfileUpdateAfterSave({
  targetUserId,
  updateData,
  targetUserBeforeUpdate,
  userDataUpdated,
  isCurrentUserStaff,
  isCurrentUserOwner,
  wasPremium,
}) {
  const premiumRevokedByStaff =
    !isCurrentUserOwner &&
    isCurrentUserStaff &&
    wasPremium &&
    !isPremiumActive(userDataUpdated);

  if (premiumRevokedByStaff) {
    try {
      await notifyPremiumRevokedByStaff(String(targetUserId));
    } catch (notifyError) {
      logServerEvent("error", {
        event: "notifypremiumrevokedbystaff",
        error: notifyError instanceof Error ? notifyError.message : String(notifyError),
      });
    }
  }

  const becameBlocked =
    updateData.isBlockedUser === true && targetUserBeforeUpdate.isBlockedUser !== true;
  const becameInactive =
    updateData.isActiveUser === false && targetUserBeforeUpdate.isActiveUser !== false;

  if (!becameBlocked && !becameInactive) {
    return;
  }

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
}
