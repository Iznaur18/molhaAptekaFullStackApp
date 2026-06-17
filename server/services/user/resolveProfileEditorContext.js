import {
  ALLOWED_FIELDS_FOR_ADMIN,
  ALLOWED_FIELDS_FOR_ADMIN_SELF,
  ALLOWED_FIELDS_FOR_MODERATOR,
  ALLOWED_FIELDS_FOR_MODERATOR_SELF,
  ALLOWED_FIELDS_FOR_USER,
} from "../../constants/constants.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { isStaffRole } from "../access/adminUserGuard.js";

import {
  INVALID_EDITOR_TOKEN_MESSAGE,
  PROFILE_UPDATE_FORBIDDEN_MESSAGE,
} from "./updateProfileConstants.js";

/**
 * @param {string} currentUserId
 * @param {string} targetUserId
 */
export async function resolveProfileEditorContext(currentUserId, targetUserId) {
  const currentUserRole = await UserModel.findById(currentUserId)
    .select("userRole")
    .lean();

  if (!currentUserRole) {
    throw new AppError(401, INVALID_EDITOR_TOKEN_MESSAGE);
  }

  const isCurrentUserOwner = String(currentUserId) === String(targetUserId);
  const editorRole = currentUserRole.userRole;
  const isCurrentUserAdmin = editorRole === "admin";
  const isCurrentUserStaff = isStaffRole(editorRole);

  if (!isCurrentUserOwner && !isCurrentUserStaff) {
    throw new AppError(403, PROFILE_UPDATE_FORBIDDEN_MESSAGE);
  }

  const allowedFields = isCurrentUserOwner
    ? isCurrentUserAdmin
      ? ALLOWED_FIELDS_FOR_ADMIN_SELF
      : editorRole === "moderator"
        ? ALLOWED_FIELDS_FOR_MODERATOR_SELF
        : ALLOWED_FIELDS_FOR_USER
    : isCurrentUserAdmin
      ? ALLOWED_FIELDS_FOR_ADMIN
      : ALLOWED_FIELDS_FOR_MODERATOR;

  return {
    editorRole,
    isCurrentUserOwner,
    isCurrentUserAdmin,
    isCurrentUserStaff,
    allowedFields,
  };
}
