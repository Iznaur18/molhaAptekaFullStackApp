import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { assertCanDeleteUser } from "../access/adminUserGuard.js";

import {
  INVALID_EDITOR_TOKEN_MESSAGE,
  PROFILE_DELETE_FORBIDDEN_MESSAGE,
  PROFILE_DELETE_TARGET_NOT_FOUND_MESSAGE,
} from "./updateProfileConstants.js";

/**
 * Удалять профиль может владелец (самоудаление — требование App Store 5.1.1(v)
 * и Google Play) либо админ — чужой профиль.
 *
 * @param {string} currentUserId
 * @param {string} targetUserId
 * @returns {Promise<{ targetUser: { _id: unknown; userName?: string }; isSelfDelete: boolean }>}
 */
export async function assertProfileDeleteAllowed(currentUserId, targetUserId) {
  const currentUserRole = await UserModel.findById(currentUserId)
    .select("userRole")
    .lean();

  if (!currentUserRole) {
    throw new AppError(401, INVALID_EDITOR_TOKEN_MESSAGE);
  }

  const targetUser = await UserModel.findById(targetUserId)
    .select("_id userName")
    .lean();

  if (!targetUser) {
    throw new AppError(404, PROFILE_DELETE_TARGET_NOT_FOUND_MESSAGE);
  }

  const isSelfDelete = String(currentUserId) === String(targetUserId);
  const isCurrentUserAdmin = currentUserRole.userRole === "admin";

  if (!isSelfDelete && !isCurrentUserAdmin) {
    throw new AppError(403, PROFILE_DELETE_FORBIDDEN_MESSAGE);
  }

  try {
    await assertCanDeleteUser(targetUserId);
  } catch (error) {
    throw new AppError(
      400,
      error instanceof Error ? error.message : "Нельзя удалить пользователя",
    );
  }

  return { targetUser, isSelfDelete };
}
