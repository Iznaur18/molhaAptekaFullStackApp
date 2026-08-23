import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { bumpUserAuthTokenVersion } from "../../services/auth/userAuthTokenVersion.js";
import {
  USER_DATA,
  ALLOWED_FIELDS_FOR_USER,
  ALLOWED_FIELDS_FOR_ADMIN,
  ALLOWED_FIELDS_FOR_ADMIN_SELF,
  ALLOWED_FIELDS_FOR_MODERATOR,
  ALLOWED_FIELDS_FOR_MODERATOR_SELF,
} from "../../constants/constants.js";
import {
  isStaffRole,
  assertCanSetUserRole,
} from "../../services/access/adminUserGuard.js";
import { cancelIntroAdCampaignsForAdvertiser } from "../../services/intro-ad/introAdCampaignHelpers.js";
import { normalizeUserBackgroundForSave } from "../../services/user/userBackgroundValue.js";
import {
  normalizeUserAvatarFocus,
  normalizeUserBackgroundFocus,
} from "../../services/user/profileImageFocus.js";
import { buildUserProfileMongoUpdate } from "../../services/user/buildUserProfileMongoUpdate.js";
import { applyVerifiedUserAddressesUpdate } from "../../services/user/applyVerifiedUserAddressesUpdate.js";
import { buildLegacyVerifiedUserAddresses } from "../../services/user/buildLegacyVerifiedUserAddresses.js";
import { resolveUserAddressCityNormalized } from "../../services/product/ruCityNormalized.js";
import { normalizeStoredUploadUrl } from "../../services/upload/buildPublicUploadUrl.js";
import { rejectPendingDataConfirmationForUser } from "../../services/user/userDataConfirmationHelpers.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  applyPremiumExpiryAdminUpdate,
  isPremiumActive,
  notifyPremiumRevokedByStaff,
  resolvePremiumFlagsFromExpiry,
} from "../../services/user/premiumAccess.js";
import {
  canStaffManageTargetPremium,
  canStaffManageTargetUser,
  updateTouchesAdminProtectedFields,
} from "../../services/access/premiumStaffAccess.js";
import { PHONE_CHANGE_REQUIRES_OTP_MESSAGE } from "../../constants/phoneVerificationConstants.js";

/** Обновление профиля пользователя. PATCH /user/:userId (требует Authorization: Bearer <token>) */
export const userUpdateProfileController = async (req, res) => {
  try {
    const currentUserId = req.userId; // кто обновляет (id из auth middleware) Прошел ли JWT авторизацию
    const targetUserId = req.params.userIdClient; // кого обновляем (id из URL) ID пользователя которого обновляем (валидация выполняется в middleware userIdParamValidation)

    // 1. Проверка существования текущего пользователя
    const currentUserRole = await UserModel.findById(currentUserId)
      .select("userRole")
      .lean(); // ищем пользователя в БД по id и выбираем поле userRole

    if (!currentUserRole) {
      return errorRes(res, 401, "Текущий пользователь не найден. Токен недействителен");
    }

    const isCurrentUserOwner = String(currentUserId) === String(targetUserId);
    const editorRole = currentUserRole.userRole;
    const isCurrentUserAdmin = editorRole === "admin";
    const isCurrentUserStaff = isStaffRole(editorRole);

    if (!isCurrentUserOwner && !isCurrentUserStaff) {
      return errorRes(res, 403, "У вас нет прав на обновление этого профиля");
    }

    const updateData = {};
    const allowedFields = isCurrentUserOwner
      ? isCurrentUserAdmin
        ? ALLOWED_FIELDS_FOR_ADMIN_SELF
        : editorRole === "moderator"
          ? ALLOWED_FIELDS_FOR_MODERATOR_SELF
          : ALLOWED_FIELDS_FOR_USER
      : isCurrentUserAdmin
        ? ALLOWED_FIELDS_FOR_ADMIN
        : ALLOWED_FIELDS_FOR_MODERATOR;

    // 3. Сбор и конвертация данных для обновления (валидация форматов и типов выполняется в middleware updateProfileValidation)
    for (const field of allowedFields) {
      if (field === "userAddresses") {
        continue;
      }
      if (req.body[field] !== undefined) {
        // если поле есть в запросе и не undefined, то добавляем его в updateData
        const value = req.body[field]; // значение поля из запроса (уже валидировано в middleware)

        // Конвертация типов данных (валидация форматов уже выполнена в middleware)
        if (field === "userBirthDate") {
          // Конвертация даты (валидация формата и диапазона уже выполнена в middleware)
          if (value !== null && value !== "") {
            updateData[field] = new Date(value); // конвертируем строку в Date объект
          } else {
            updateData[field] = null; // разрешаем очистку поля
          }
        } else if (field === "userDiscountPercent") {
          // Конвертация в число (валидация диапазона уже выполнена в middleware)
          updateData[field] = Number(value);
        } else if (field === "userLoyaltyPoints") {
          const points = Math.floor(Number(value));
          updateData[field] = Number.isFinite(points) ? Math.max(0, points) : 0;
        } else if (field === "premiumExpiresAt") {
          if (value === null || value === "") {
            updateData.premiumExpiresAt = null;
          } else {
            updateData.premiumExpiresAt = new Date(value);
          }
        } else if (field === "userName") {
          updateData[field] =
            typeof value === "string" ? value.trim().toLowerCase() : value;
        } else if (
          field === "userPhoneNumber" ||
          field === "userAddress" ||
          field === "userAddressFlat" ||
          field === "userAddressFiasId" ||
          field === "notesAboutUser" ||
          field === "socialTelegramUrl" ||
          field === "socialInstagramUrl" ||
          field === "socialVkUrl" ||
          field === "socialYoutubeUrl" ||
          field === "socialWhatsappUrl" ||
          field === "socialWebsiteUrl"
        ) {
          // Для строковых полей применяем trim (валидация уже выполнена в middleware)
          updateData[field] = typeof value === "string" ? value.trim() : value;
        } else if (field === "userAddressGeo") {
          updateData[field] = value;
        } else if (field === "userAvatarUrl") {
          const trimmed = typeof value === "string" ? value.trim() : "";
          updateData[field] =
            trimmed === "" ? trimmed : normalizeStoredUploadUrl(trimmed);
        } else if (field === "userAvatarFocus") {
          updateData[field] = normalizeUserAvatarFocus(value);
        } else if (field === "userBackgroundFocus") {
          updateData[field] = normalizeUserBackgroundFocus(value);
        } else {
          // Для остальных полей (userGender, userRole, URL поля, булевы) - просто присваиваем (валидация уже выполнена в middleware)
          updateData[field] = value;
        }
      }
    }

    if (req.verifiedUserAddresses !== undefined) {
      applyVerifiedUserAddressesUpdate(updateData, req.verifiedUserAddresses);
    } else if (req.verifiedDeliveryAddress !== undefined) {
      if (req.verifiedDeliveryAddress === null) {
        applyVerifiedUserAddressesUpdate(updateData, []);
      } else {
        const existingUser = await UserModel.findById(targetUserId)
          .select("userAddresses")
          .lean();
        const existingAddresses = Array.isArray(existingUser?.userAddresses)
          ? existingUser.userAddresses
          : [];
        const nextAddresses = buildLegacyVerifiedUserAddresses(
          existingAddresses,
          req.verifiedDeliveryAddress,
        );
        applyVerifiedUserAddressesUpdate(updateData, nextAddresses);
      }
    } else if (Object.prototype.hasOwnProperty.call(updateData, "userAddressCity")) {
      updateData.userAddressCityNormalized = resolveUserAddressCityNormalized(
        updateData.userAddressCity,
      );
    }

    // 4. Проверка, что есть данные для обновления
    if (Object.keys(updateData).length === 0) {
      return errorRes(
        res,
        400,
        "Нет данных для обновления. Укажите хотя бы одно разрешенное поле",
      );
    }

    // Владелец: телефон только через /auth/phone/bind/* (OTP). Staff — может PATCH.
    if (isCurrentUserOwner && Object.prototype.hasOwnProperty.call(updateData, "userPhoneNumber")) {
      return errorRes(res, 403, PHONE_CHANGE_REQUIRES_OTP_MESSAGE);
    }

    if (updateData.userRole !== undefined) {
      if (!isCurrentUserAdmin) {
        return errorRes(res, 403, "Только администратор может менять роль");
      }
      try {
        await assertCanSetUserRole(targetUserId, updateData.userRole);
      } catch (e) {
        return errorRes(
          res,
          400,
          e instanceof Error ? e.message : "Нельзя изменить роль",
        );
      }
    }

    if (updateData.userDiscountPercent !== undefined && !isCurrentUserAdmin) {
      return errorRes(res, 403, "Только администратор может менять скидку");
    }

    const targetUserBeforeUpdate = await UserModel.findById(targetUserId)
      .select(
        "isPremiumUser premiumExpiresAt userBackgroundUrl isUserDataConfirmed userRole isBlockedUser isActiveUser userPhoneNumber",
      )
      .lean();

    if (!targetUserBeforeUpdate) {
      return errorRes(res, 404, "Пользователь не найден");
    }

    const isPremiumFieldUpdate =
      updateData.isPremiumUser !== undefined ||
      updateData.premiumExpiresAt !== undefined;

    if (isPremiumFieldUpdate) {
      if (isCurrentUserOwner) {
        if (!isCurrentUserAdmin) {
          return errorRes(res, 403, "Только администратор может менять свой премиум");
        }
      } else if (!isCurrentUserStaff) {
        return errorRes(res, 403, "Нет прав на изменение премиума");
      } else if (
        !canStaffManageTargetPremium({
          editorRole,
          targetRole: targetUserBeforeUpdate.userRole,
        })
      ) {
        return errorRes(res, 403, "Модератор не может менять премиум администратора");
      }
    }

    if (updateData.userLoyaltyPoints !== undefined) {
      if (!isCurrentUserStaff) {
        return errorRes(res, 403, "Только staff может менять баллы лояльности");
      }
      if (isCurrentUserOwner) {
        return errorRes(res, 403, "Нельзя менять свои баллы лояльности");
      }
    }

    if (
      !isCurrentUserOwner &&
      updateTouchesAdminProtectedFields(updateData) &&
      !canStaffManageTargetUser({
        editorRole,
        targetRole: targetUserBeforeUpdate.userRole,
      })
    ) {
      return errorRes(res, 403, "Модератор не может менять эти поля у администратора");
    }

    // 5. Проверка уникальности userName и userPhoneNumber перед обновлением
    if (updateData.userName) {
      const existingUser = await UserModel.findOne({
        userName: updateData.userName,
        _id: { $ne: targetUserId },
      });
      if (existingUser) {
        return errorRes(res, 409, "Пользователь с таким именем уже существует");
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
        return errorRes(
          res,
          409,
          "Пользователь с таким номером телефона уже существует",
        );
      }
      const prevPhone = String(targetUserBeforeUpdate.userPhoneNumber ?? "").trim();
      const nextPhone = String(updateData.userPhoneNumber).trim();
      if (nextPhone !== prevPhone) {
        updateData.isPhoneVerified = false;
      }
    } else if (
      Object.prototype.hasOwnProperty.call(updateData, "userPhoneNumber") &&
      (updateData.userPhoneNumber === null || updateData.userPhoneNumber === "")
    ) {
      updateData.isPhoneVerified = false;
    }

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
      } catch (e) {
        return errorRes(
          res,
          400,
          e instanceof Error ? e.message : "Некорректная дата премиума",
        );
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
      } catch (e) {
        return errorRes(
          res,
          400,
          e instanceof Error ? e.message : "Некорректный фон профиля",
        );
      }
    }

    const wasDataConfirmed = Boolean(targetUserBeforeUpdate.isUserDataConfirmed);
    const nextDataConfirmed =
      updateData.isUserDataConfirmed !== undefined
        ? Boolean(updateData.isUserDataConfirmed)
        : wasDataConfirmed;

    if (wasDataConfirmed && !nextDataConfirmed) {
      try {
        await rejectPendingDataConfirmationForUser(
          targetUserId,
          undefined,
          isCurrentUserStaff ? currentUserId : null,
        );
      } catch (rejectError) {
        logServerEvent("error", {
          event: "rejectpendingdataconfirmationforuser",
          error:
            rejectError instanceof Error ? rejectError.message : String(rejectError),
        });
      }
    }

    // 6. Логирование изменений (для аудита)
    const mongoUpdate = buildUserProfileMongoUpdate(updateData);
    if (Object.keys(mongoUpdate).length === 0) {
      return errorRes(
        res,
        400,
        "Нет данных для обновления. Укажите хотя бы одно разрешенное поле",
      );
    }
    logServerEvent("info", {
      event: "update_profile",
      actorUserId: currentUserId,
      targetUserId,
      fields: Object.keys(mongoUpdate),
    });

    // 7. Обновление профиля пользователя
    const selectFields =
      isCurrentUserStaff && !isCurrentUserOwner ? USER_DATA : allowedFields.join(" ");
    const userDataUpdated = await UserModel.findByIdAndUpdate(
      targetUserId,
      mongoUpdate,
      { returnDocument: "after", runValidators: true },
    )
      .select(selectFields)
      .lean();

    if (!userDataUpdated) {
      return errorRes(res, 404, "Пользователь не найден или не удалось обновить");
    }

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
          error:
            notifyError instanceof Error ? notifyError.message : String(notifyError),
        });
      }
    }

    const becameBlocked =
      updateData.isBlockedUser === true &&
      targetUserBeforeUpdate.isBlockedUser !== true;
    const becameInactive =
      updateData.isActiveUser === false &&
      targetUserBeforeUpdate.isActiveUser !== false;

    if (becameBlocked || becameInactive) {
      try {
        await bumpUserAuthTokenVersion(String(targetUserId));
      } catch (tokenVersionError) {
        logServerEvent("error", {
          event: "bumpuserauthtokenversion",
          error:
            tokenVersionError instanceof Error
              ? tokenVersionError.message
              : String(tokenVersionError),
        });
      }
    }

    if (becameBlocked || becameInactive) {
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

    return successRes(res, {
      user: userDataUpdated,
      message: "Профиль успешно обновлен",
    });
  } catch (error) {
    logServerEvent("error", {
      event: "userupdateprofile",
      error: error instanceof Error ? error.message : String(error),
    });

    // Обработка специфичных ошибок MongoDB
    if (error.name === "ValidationError") {
      // Ошибка валидации схемы Mongoose
      const errors = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return errorRes(res, 400, `Ошибка валидации: ${errors}`);
    }

    if (error.name === "CastError") {
      return errorRes(res, 400, "Неверный формат данных");
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return errorRes(res, 409, `Пользователь с таким ${field} уже существует`);
    }

    return errorRes(res, 500, "Ошибка при обновлении профиля");
  }
};
