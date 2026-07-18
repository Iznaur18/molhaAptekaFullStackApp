import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";

import { assertProfileDeleteAllowed } from "./assertProfileDeleteAllowed.js";
import { runProfileDeleteCascade } from "./runProfileDeleteCascade.js";
import { PROFILE_DELETE_ALREADY_REMOVED_MESSAGE } from "./updateProfileConstants.js";

/**
 * @param {{
 *   currentUserId: string;
 *   targetUserId: string;
 * }} input
 */
export async function deleteProfile({ currentUserId, targetUserId }) {
  const { targetUser, isSelfDelete } = await assertProfileDeleteAllowed(
    currentUserId,
    targetUserId,
  );

  console.log(
    `[DELETE PROFILE] User ${currentUserId} deleting profile ${targetUserId} (${targetUser.userName || "N/A"})${isSelfDelete ? " [self]" : ""}`,
  );

  await runProfileDeleteCascade(targetUserId);

  const deletedUser = await UserModel.findByIdAndDelete(targetUserId);
  if (!deletedUser) {
    throw new AppError(404, PROFILE_DELETE_ALREADY_REMOVED_MESSAGE);
  }

  return { isSelfDelete };
}
