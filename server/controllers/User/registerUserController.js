import bcrypt from 'bcrypt';
import { UserModel } from '../../models/index.js';
import { sendUserWithToken, errorRes } from '../../utils/index.js';
import { DEFAULT_AVATAR_URL, DEFAULT_BACKGROUND_URL } from '../../constants/constants.js';

function pickUrlOrDefault(value, defaultUrl) {
  if (value == null || String(value).trim() === '') return defaultUrl;
  return String(value).trim();
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
      backgroundUrl,
      userBirthDate,
      userGender,
      userAddress,
      notificationsEnabled,
    } = req.body;

    const orConditions = [{ email }];
    if (userName != null && String(userName).trim() !== '') {
      orConditions.push({ userName: String(userName).trim().toLowerCase() });
    }
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
      userName:
        userName != null && String(userName).trim() !== ''
          ? String(userName).trim().toLowerCase()
          : undefined,
      userPhoneNumber,
      userAvatarUrl: pickUrlOrDefault(avatarUrl, DEFAULT_AVATAR_URL),
      userBackgroundUrl: pickUrlOrDefault(backgroundUrl, DEFAULT_BACKGROUND_URL),
      ...(userBirthDate ? { userBirthDate: new Date(userBirthDate) } : {}),
      ...(userGender ? { userGender } : {}),
      ...(userAddress != null && String(userAddress).trim() !== ''
        ? { userAddress: String(userAddress).trim() }
        : {}),
      ...(typeof notificationsEnabled === 'boolean' ? { notificationsEnabled } : {}),
    });

    const user = await doc.save();

    return sendUserWithToken(user, res);
  } catch (error) {
    console.error(error);
    return errorRes(res, 500, 'Ошибка при регистрации пользователя');
  }
};
