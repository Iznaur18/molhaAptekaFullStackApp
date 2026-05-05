import {
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
} from "../model/userConstants.js";

/**
 * @param {{
 *   email: string;
 *   password: string;
 *   userName: string;
 *   phoneNumber: string;
 *   avatarUrl: string;
 *   backgroundUrl: string;
 *   userBirthDate: string;
 *   userGender: string;
 *   userAddress: string;
 *   notificationsEnabled: boolean;
 * }} form
 * @returns {import('../model/types.js').RegisterUserPayload}
 */
export function buildRegisterUserPayload(form) {
  const trimOrUndef = (value) => {
    if (value == null || String(value).trim() === "") return undefined;
    return String(value).trim();
  };

  const payload = {
    email: form.email.trim(),
    password: form.password,
  };

  const userName = trimOrUndef(form.userName);
  const phoneNumber = trimOrUndef(form.phoneNumber);
  const avatarUrl = trimOrUndef(form.avatarUrl);
  const backgroundUrl = trimOrUndef(form.backgroundUrl);
  const userAddress = trimOrUndef(form.userAddress);
  const userBirthDate = trimOrUndef(form.userBirthDate);

  if (userName) payload.userName = userName;
  if (phoneNumber) payload.phoneNumber = phoneNumber;
  if (avatarUrl) payload.avatarUrl = avatarUrl;
  if (backgroundUrl) payload.backgroundUrl = backgroundUrl;
  if (userAddress) payload.userAddress = userAddress;
  if (userBirthDate) payload.userBirthDate = userBirthDate;

  const allowedGender = [
    USER_GENDER_MALE,
    USER_GENDER_FEMALE,
    USER_GENDER_NO_SELECTED,
  ];
  if (allowedGender.includes(form.userGender)) {
    payload.userGender = form.userGender;
  }

  payload.notificationsEnabled = Boolean(form.notificationsEnabled);

  return payload;
}
