import { addressValueFromUser } from "../../address/lib/addressValueFromUser.js";
import {
  getUserAvatarFocus,
  getUserBackgroundFocus,
} from "./profileImageFocus.js";
import { parseUserBackgroundFormFields } from "./userBackgroundValue.js";
import { formatPremiumExpiresAtForInput } from "./formatPremiumExpiresAtForInput.js";
import {
  DEFAULT_USER_AVATAR_URL,
  DEFAULT_USER_BACKGROUND_PRESET_ID,
  USER_GENDER_NO_SELECTED,
  USER_ROLE_USER,
} from "../model/userConstants.js";

/**
 * @typedef {object} EditProfileFormState
 * @property {string} userName
 * @property {string} userBirthDate
 * @property {'male'|'female'|'noSelected'} userGender
 * @property {import('../../address/model/types.js').RuDeliveryAddressValue} deliveryAddress
 * @property {string} userPhoneNumber
 * @property {string} userAvatarUrl
 * @property {{ x: number; y: number }} userAvatarFocus
 * @property {string} backgroundPresetId
 * @property {{ x: number; y: number }} userBackgroundFocus
 * @property {string} backgroundImageUrl
 * @property {boolean} notificationsEnabled
 * @property {string} notesAboutUser
 * @property {'user'|'admin'|'moderator'} userRole
 * @property {string} userDiscountPercent
 * @property {string} userLoyaltyPoints
 * @property {string} premiumExpiresAt
 * @property {boolean} isActiveUser
 * @property {boolean} isUserDataConfirmed
 * @property {boolean} isBlockedUser
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

  const { presetId, imageUrl } = parseUserBackgroundFormFields(
    user.userBackgroundUrl,
  );

  return {
    userName: user.userName ?? "",
    userBirthDate: birthInput,
    userGender: user.userGender ?? USER_GENDER_NO_SELECTED,
    deliveryAddress: addressValueFromUser(user),
    userPhoneNumber: user.userPhoneNumber ?? "",
    userAvatarUrl: user.userAvatarUrl ?? DEFAULT_USER_AVATAR_URL,
    userAvatarFocus: getUserAvatarFocus(user),
    backgroundPresetId: presetId || DEFAULT_USER_BACKGROUND_PRESET_ID,
    backgroundImageUrl: imageUrl,
    userBackgroundFocus: getUserBackgroundFocus(user),
    notificationsEnabled: Boolean(user.notificationsEnabled),
    notesAboutUser: user.notesAboutUser ?? "",
    userRole: user.userRole ?? USER_ROLE_USER,
    userDiscountPercent:
      user.userDiscountPercent != null ? String(user.userDiscountPercent) : "0",
    userLoyaltyPoints:
      user.userLoyaltyPoints != null ? String(user.userLoyaltyPoints) : "0",
    premiumExpiresAt: formatPremiumExpiresAtForInput(user.premiumExpiresAt),
    isActiveUser: user.isActiveUser !== false,
    isUserDataConfirmed: user.isUserDataConfirmed === true,
    isBlockedUser: Boolean(user.isBlockedUser),
  };
}
