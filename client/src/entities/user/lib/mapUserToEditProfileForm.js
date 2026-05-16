import { addressValueFromUser } from "../../address/lib/addressValueFromUser.js";
import {
  DEFAULT_USER_AVATAR_URL,
  DEFAULT_USER_BACKGROUND_URL,
  USER_GENDER_NO_SELECTED,
} from "../model/userConstants.js";

/**
 * @typedef {object} EditProfileFormState
 * @property {string} userName
 * @property {string} userBirthDate
 * @property {'male'|'female'|'noSelected'} userGender
 * @property {import('../../address/model/types.js').RuDeliveryAddressValue} deliveryAddress
 * @property {string} userPhoneNumber
 * @property {string} userAvatarUrl
 * @property {string} userBackgroundUrl
 * @property {boolean} notificationsEnabled
 * @property {string} notesAboutUser
 */

/**
 * @param {Partial<import('../model/types.js').UserPublicProfile>} user
 * @returns {EditProfileFormState}
 */
export function mapUserToEditProfileForm(user) {
  const birth = user.userBirthDate;
  const birthInput =
    typeof birth === "string" && birth.length >= 10
      ? birth.slice(0, 10)
      : "";

  return {
    userName: user.userName ?? "",
    userBirthDate: birthInput,
    userGender: user.userGender ?? USER_GENDER_NO_SELECTED,
    deliveryAddress: addressValueFromUser(user),
    userPhoneNumber: user.userPhoneNumber ?? "",
    userAvatarUrl: user.userAvatarUrl ?? DEFAULT_USER_AVATAR_URL,
    userBackgroundUrl: user.userBackgroundUrl ?? DEFAULT_USER_BACKGROUND_URL,
    notificationsEnabled: Boolean(user.notificationsEnabled),
    notesAboutUser: user.notesAboutUser ?? "",
  };
}
