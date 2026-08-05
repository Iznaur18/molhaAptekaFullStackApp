import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { assertCanSetUserRole } from "../access/adminUserGuard.js";
import {
  isPremiumActive,
  applyPremiumExpiryAdminUpdate,
  resolvePremiumFlagsFromExpiry,
} from "./premiumAccess.js";
import {
  canStaffManageTargetPremium,
  canStaffManageTargetUser,
  updateTouchesAdminProtectedFields,
} from "../access/premiumStaffAccess.js";
import { normalizeUserBackgroundForSave } from "./userBackgroundValue.js";

import { EMPTY_PROFILE_UPDATE_MESSAGE } from "./updateProfileConstants.js";
import { PHONE_CHANGE_REQUIRES_OTP_MESSAGE } from "../../constants/phoneVerificationConstants.js";

const throwRuleError = (error, fallback, statusCode = 400) => {
  throw new AppError(statusCode, error instanceof Error ? error.message : fallback);
};

const assertRoleChangeAllowed = async (
  updateData,
  isCurrentUserAdmin,
  targetUserId,
) => {
  if (updateData.userRole === undefined) {
    return;
  }
  if (!isCurrentUserAdmin) {
    throw new AppError(403, "Только администратор может менять роль");
  }
  try {
    await assertCanSetUserRole(targetUserId, updateData.userRole);
  } catch (error) {
    throwRuleError(error, "Нельзя изменить роль");
  }
};

const assertDiscountChangeAllowed = (updateData, isCurrentUserAdmin) => {
  if (updateData.userDiscountPercent !== undefined && !isCurrentUserAdmin) {
    throw new AppError(403, "Только администратор может менять скидку");
  }
};

const assertPremiumChangeAllowed = (
  updateData,
  editorContext,
  targetUserBeforeUpdate,
) => {
  const isPremiumFieldUpdate =
    updateData.isPremiumUser !== undefined || updateData.premiumExpiresAt !== undefined;

  if (!isPremiumFieldUpdate) {
    return;
  }

  const { isCurrentUserOwner, isCurrentUserAdmin, isCurrentUserStaff, editorRole } =
    editorContext;

  if (isCurrentUserOwner) {
    if (!isCurrentUserAdmin) {
      throw new AppError(403, "Только администратор может менять свой премиум");
    }
    return;
  }

  if (!isCurrentUserStaff) {
    throw new AppError(403, "Нет прав на изменение премиума");
  }

  if (
    !canStaffManageTargetPremium({
      editorRole,
      targetRole: targetUserBeforeUpdate.userRole,
    })
  ) {
    throw new AppError(403, "Модератор не может менять премиум администратора");
  }
};

const assertLoyaltyChangeAllowed = (updateData, editorContext) => {
  if (updateData.userLoyaltyPoints === undefined) {
    return;
  }
  const { isCurrentUserStaff, isCurrentUserOwner } = editorContext;
  if (!isCurrentUserStaff) {
    throw new AppError(403, "Только staff может менять баллы лояльности");
  }
  if (isCurrentUserOwner) {
    throw new AppError(403, "Нельзя менять свои баллы лояльности");
  }
};

const assertOwnerPhoneChangeRequiresOtp = (updateData, editorContext) => {
  const { isCurrentUserOwner } = editorContext;
  if (
    isCurrentUserOwner &&
    Object.prototype.hasOwnProperty.call(updateData, "userPhoneNumber")
  ) {
    throw new AppError(403, PHONE_CHANGE_REQUIRES_OTP_MESSAGE);
  }
};

const assertAdminProtectedFieldsAllowed = (
  updateData,
  editorContext,
  targetUserBeforeUpdate,
) => {
  const { isCurrentUserOwner, editorRole } = editorContext;
  if (isCurrentUserOwner || !updateTouchesAdminProtectedFields(updateData)) {
    return;
  }
  if (
    !canStaffManageTargetUser({
      editorRole,
      targetRole: targetUserBeforeUpdate.userRole,
    })
  ) {
    throw new AppError(403, "Модератор не может менять эти поля у администратора");
  }
};

const assertUniqueProfileFields = async (updateData, targetUserId) => {
  if (updateData.userName) {
    const existingUser = await UserModel.findOne({
      userName: updateData.userName,
      _id: { $ne: targetUserId },
    });
    if (existingUser) {
      throw new AppError(409, "Пользователь с таким именем уже существует");
    }
  }

  if (
    updateData.userPhoneNumber &&
    updateData.userPhoneNumber !== null &&
    updateData.userPhoneNumber !== ""
  ) {
    const existingPhone = await UserModel.findOne({
      userPhoneNumber: updateData.userPhoneNumber,
      _id: { $ne: targetUserId },
    });
    if (existingPhone) {
      throw new AppError(409, "Пользователь с таким номером телефона уже существует");
    }
  }
};

const applyPremiumAndBackgroundRules = (
  updateData,
  editorContext,
  targetUserBeforeUpdate,
) => {
  const { isCurrentUserOwner, isCurrentUserAdmin, isCurrentUserStaff, editorRole } =
    editorContext;

  const wasPremium = isPremiumActive(targetUserBeforeUpdate);
  const canResolvePremiumExpiry =
    updateData.premiumExpiresAt !== undefined &&
    ((isCurrentUserOwner && isCurrentUserAdmin) ||
      (!isCurrentUserOwner &&
        isCurrentUserStaff &&
        canStaffManageTargetPremium({
          editorRole,
          targetRole: targetUserBeforeUpdate.userRole,
        })));

  if (canResolvePremiumExpiry) {
    try {
      const resolved = resolvePremiumFlagsFromExpiry(updateData.premiumExpiresAt);
      updateData.premiumExpiresAt = resolved.premiumExpiresAt;
      updateData.isPremiumUser = resolved.isPremiumUser;
    } catch (error) {
      throwRuleError(error, "Некорректная дата премиума");
    }
  }

  const nextPremium =
    updateData.isPremiumUser !== undefined
      ? Boolean(updateData.isPremiumUser)
      : updateData.premiumExpiresAt !== undefined
        ? Boolean(updateData.isPremiumUser)
        : wasPremium;

  applyPremiumExpiryAdminUpdate({
    wasPremium,
    nextPremium,
    currentBackground: targetUserBeforeUpdate.userBackgroundUrl,
    updateData,
  });

  if (updateData.userBackgroundUrl !== undefined) {
    try {
      updateData.userBackgroundUrl = normalizeUserBackgroundForSave(
        updateData.userBackgroundUrl,
        {
          isPremiumUser: nextPremium,
          isAdminEditor: isCurrentUserStaff,
        },
      );
    } catch (error) {
      throwRuleError(error, "Некорректный фон профиля");
    }
  }

  return { wasPremium, nextPremium };
};

/**
 * @param {{
 *   updateData: Record<string, unknown>;
 *   targetUserId: string;
 *   editorContext: Awaited<ReturnType<typeof import("./resolveProfileEditorContext.js").resolveProfileEditorContext>>;
 * }} input
 */
export async function assertProfileUpdateRules({
  updateData,
  targetUserId,
  editorContext,
}) {
  if (Object.keys(updateData).length === 0) {
    throw new AppError(400, EMPTY_PROFILE_UPDATE_MESSAGE);
  }

  const { isCurrentUserAdmin } = editorContext;

  await assertRoleChangeAllowed(updateData, isCurrentUserAdmin, targetUserId);
  assertDiscountChangeAllowed(updateData, isCurrentUserAdmin);
  assertOwnerPhoneChangeRequiresOtp(updateData, editorContext);

  const targetUserBeforeUpdate = await UserModel.findById(targetUserId)
    .select(
      "isPremiumUser premiumExpiresAt userBackgroundUrl isUserDataConfirmed userRole isBlockedUser isActiveUser",
    )
    .lean();

  if (!targetUserBeforeUpdate) {
    throw new AppError(404, "Пользователь не найден");
  }

  assertPremiumChangeAllowed(updateData, editorContext, targetUserBeforeUpdate);
  assertLoyaltyChangeAllowed(updateData, editorContext);
  assertAdminProtectedFieldsAllowed(updateData, editorContext, targetUserBeforeUpdate);
  await assertUniqueProfileFields(updateData, targetUserId);

  const premiumState = applyPremiumAndBackgroundRules(
    updateData,
    editorContext,
    targetUserBeforeUpdate,
  );

  return {
    targetUserBeforeUpdate,
    ...premiumState,
  };
}
