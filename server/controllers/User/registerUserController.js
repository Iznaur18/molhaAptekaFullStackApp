import bcrypt from "bcrypt";

import { DEFAULT_AVATAR_URL } from "../../constants/constants.js";
import { PENDING_REGISTRATION_OCCUPIED_MESSAGE } from "../../constants/emailVerificationConstants.js";
import {
  formatUserBackgroundPresetValue,
  getDefaultUserBackgroundStoredValue,
  isUserBackgroundPresetId,
} from "../../constants/userBackgroundPresets.js";
import { errorRes, successRes } from "../../services/http/index.js";
import {
  assertRegistrationIdentityAvailable,
  createPendingRegistration,
} from "../../services/auth/pendingRegistration.js";

function pickUrlOrDefault(value, defaultUrl) {
  if (value == null || String(value).trim() === "") return defaultUrl;
  return String(value).trim();
}

function resolveRegisterBackground(presetId) {
  const id = presetId == null ? "" : String(presetId).trim();
  if (id === "") return getDefaultUserBackgroundStoredValue();
  if (!isUserBackgroundPresetId(id)) {
    return getDefaultUserBackgroundStoredValue();
  }
  return formatUserBackgroundPresetValue(id);
}

/** Регистрация: pending + код на email, без User и без JWT. POST /auth/register */
export const registerUserController = async (req, res) => {
  const {
    email,
    password,
    userName,
    phoneNumber,
    avatarUrl,
    backgroundPresetId,
    userBirthDate,
    userGender,
    notificationsEnabled,
  } = req.body;

  const normalizedUserName = String(userName).trim().toLowerCase();
  const userPhoneNumber =
    phoneNumber != null && phoneNumber !== ""
      ? String(phoneNumber).trim()
      : undefined;

  try {
    await assertRegistrationIdentityAvailable(
      email,
      normalizedUserName,
      userPhoneNumber,
    );
  } catch (availabilityError) {
    return errorRes(
      res,
      availabilityError?.statusCode ?? 400,
      availabilityError instanceof Error
        ? availabilityError.message
        : PENDING_REGISTRATION_OCCUPIED_MESSAGE,
    );
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    const pending = await createPendingRegistration({
      email,
      passwordHash,
      userName: normalizedUserName,
      userPhoneNumber,
      userAvatarUrl: pickUrlOrDefault(avatarUrl, DEFAULT_AVATAR_URL),
      userBackgroundUrl: resolveRegisterBackground(backgroundPresetId),
      userBirthDate,
      userGender,
      notificationsEnabled,
      verifiedDeliveryAddress: req.verifiedDeliveryAddress,
    });

    return successRes(res, {
      needsEmailVerification: true,
      pendingToken: pending.pendingToken,
      email: pending.email,
    });
  } catch (createError) {
    if (createError?.code === 11000) {
      return errorRes(res, 400, PENDING_REGISTRATION_OCCUPIED_MESSAGE);
    }
    throw createError;
  }
};
