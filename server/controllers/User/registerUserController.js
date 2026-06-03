import bcrypt from 'bcrypt';
import { UserModel } from '../../models/index.js';
import { sendUserWithToken, errorRes } from '../../utils/index.js';
import { sendEmailVerificationForUser } from '../../utils/emailVerification.js';
import { DEFAULT_AVATAR_URL } from '../../constants/constants.js';
import {
    formatUserBackgroundPresetValue,
    getDefaultUserBackgroundStoredValue,
    isUserBackgroundPresetId,
} from '../../constants/userBackgroundPresets.js';

function pickUrlOrDefault(value, defaultUrl) {
  if (value == null || String(value).trim() === '') return defaultUrl;
  return String(value).trim();
}

function resolveRegisterBackground(presetId) {
  const id = presetId == null ? '' : String(presetId).trim();
  if (id === '') return getDefaultUserBackgroundStoredValue();
  if (!isUserBackgroundPresetId(id)) {
    return getDefaultUserBackgroundStoredValue();
  }
  return formatUserBackgroundPresetValue(id);
}

/** Регистрация по email + пароль и опциональные поля профиля. POST /auth/register */
export const registerUserController = async (req, res) => {
  try {
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
    const orConditions = [{ email }, { userName: normalizedUserName }];
    if (phoneNumber != null && phoneNumber !== '') {
      orConditions.push({ userPhoneNumber: String(phoneNumber).trim() });
    }
    const exists = await UserModel.findOne({ $or: orConditions });
    if (exists) {
      return errorRes(res, 400, 'Пользователь с таким email или userName или userPhoneNumber уже существует');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userPhoneNumber =
      phoneNumber != null && phoneNumber !== '' ? String(phoneNumber).trim() : undefined;

    const doc = new UserModel({
      email,
      passwordHash,
      userName: normalizedUserName,
      userPhoneNumber,
      userAvatarUrl: pickUrlOrDefault(avatarUrl, DEFAULT_AVATAR_URL),
      userBackgroundUrl: resolveRegisterBackground(backgroundPresetId),
      ...(userBirthDate ? { userBirthDate: new Date(userBirthDate) } : {}),
      ...(userGender ? { userGender } : {}),
      ...(req.verifiedDeliveryAddress
        ? {
            userAddress: req.verifiedDeliveryAddress.displayAddress,
            userAddressFlat: req.verifiedDeliveryAddress.flat,
            userAddressFiasId: req.verifiedDeliveryAddress.fiasId,
            userAddressGeo: req.verifiedDeliveryAddress.geo,
          }
        : {}),
      ...(typeof notificationsEnabled === 'boolean' ? { notificationsEnabled } : {}),
    });

    const user = await doc.save();

    try {
        await sendEmailVerificationForUser(user._id);
    } catch (verificationError) {
        console.error('sendEmailVerificationForUser error:', verificationError);
    }

    return sendUserWithToken(user, res);
  } catch (error) {
    console.error(error);
    return errorRes(res, 500, 'Ошибка при регистрации пользователя');
  }
};
