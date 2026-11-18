import { USER_DATA } from "../../constants/constants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { buildUserProfileMongoUpdate } from "./buildUserProfileMongoUpdate.js";

import { assertProfileUpdateRules } from "./assertProfileUpdateRules.js";
import { buildProfileUpdateData } from "./buildProfileUpdateData.js";
import { resolveProfileEditorContext } from "./resolveProfileEditorContext.js";
import {
  runProfileUpdateAfterSave,
  runProfileUpdateBeforeSave,
} from "./runProfileUpdateSideEffects.js";
import {
  EMPTY_PROFILE_UPDATE_MESSAGE,
  PASSWORD_CHANGE_VIA_AUTH_MESSAGE,
  PASSWORD_LIKE_PROFILE_FIELDS,
} from "./updateProfileConstants.js";

/**
 * @param {{
 *   currentUserId: string;
 *   targetUserId: string;
 *   body: Record<string, unknown>;
 *   verifiedDeliveryAddress?: unknown;
 *   verifiedUserAddresses?: unknown;
 * }} input
 */
export async function updateProfile({
  currentUserId,
  targetUserId,
  body,
  verifiedDeliveryAddress,
  verifiedUserAddresses,
}) {
  if (PASSWORD_LIKE_PROFILE_FIELDS.some((field) => body?.[field] !== undefined)) {
    throw new AppError(400, PASSWORD_CHANGE_VIA_AUTH_MESSAGE);
  }

  const editorContext = await resolveProfileEditorContext(currentUserId, targetUserId);
  const { allowedFields, isCurrentUserOwner, isCurrentUserStaff } = editorContext;

  const updateData = await buildProfileUpdateData({
    body,
    allowedFields,
    targetUserId,
    verifiedDeliveryAddress,
    verifiedUserAddresses,
  });

  const { targetUserBeforeUpdate, wasPremium } = await assertProfileUpdateRules({
    updateData,
    targetUserId,
    editorContext,
  });

  await runProfileUpdateBeforeSave({
    targetUserId,
    currentUserId,
    updateData,
    targetUserBeforeUpdate,
    isCurrentUserStaff,
  });

  const mongoUpdate = buildUserProfileMongoUpdate(updateData);
  if (Object.keys(mongoUpdate).length === 0) {
    throw new AppError(400, EMPTY_PROFILE_UPDATE_MESSAGE);
  }

  logServerEvent("info", {
    event: "update_profile",
    actorUserId: currentUserId,
    targetUserId,
    fields: Object.keys(mongoUpdate),
  });

  const selectFields =
    isCurrentUserStaff && !isCurrentUserOwner ? USER_DATA : allowedFields.join(" ");

  const userDataUpdated = await UserModel.findByIdAndUpdate(targetUserId, mongoUpdate, {
    returnDocument: "after",
    runValidators: true,
  })
    .select(selectFields)
    .lean();

  if (!userDataUpdated) {
    throw new AppError(404, "Пользователь не найден или не удалось обновить");
  }

  await runProfileUpdateAfterSave({
    targetUserId,
    updateData,
    targetUserBeforeUpdate,
    userDataUpdated,
    isCurrentUserStaff,
    isCurrentUserOwner,
    wasPremium,
  });

  return {
    user: userDataUpdated,
    message: "Профиль успешно обновлен",
  };
}
