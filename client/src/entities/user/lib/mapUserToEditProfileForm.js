import {
  USER_SOCIAL_LINK_FIELD_IDS,
  storedSocialUrlToInputValue,
  DEFAULT_VIEWER_REGION_CODE,
  isRuRegionCode,
} from "@molha/api-contract";

import { userSavedAddressesFromUser } from "../../address/lib/userSavedAddressesFromUser.js";
import { mapUserBusinessHoursFromUser } from "./userBusinessHoursForm.js";
import { getUserAvatarFocus, getUserBackgroundFocus } from "./profileImageFocus.js";
import { parseUserBackgroundFormFields } from "./userBackgroundValue.js";
import { formatPremiumExpiresAtForInput } from "./formatPremiumExpiresAtForInput.js";
import { maskRuPhoneInput } from "./ruPhone.js";
import {
  DEFAULT_USER_AVATAR_URL,
  DEFAULT_USER_BACKGROUND_PRESET_ID,
  USER_GENDER_NO_SELECTED,
  USER_ROLE_USER,
} from "../model/userConstants.js";

/**
 * @typedef {object} EditProfileFormState
 * @property {string} userName
 * @property {string} userFullName
 * @property {string} email
 * @property {string} userBirthDate
 * @property {'male'|'female'|'noSelected'} userGender
 * @property {import('../../address/model/userSavedAddressTypes.js').UserSavedAddressFormValue[]} savedAddresses
 * @property {string} userRegionCode
 * @property {string} userPhoneNumber
 * @property {string} userAvatarUrl
 * @property {{ x: number; y: number }} userAvatarFocus
 * @property {string} backgroundPresetId
 * @property {{ x: number; y: number }} userBackgroundFocus
 * @property {string} backgroundImageUrl
 * @property {boolean} notificationsEnabled
 * @property {string} notesAboutUser
 * @property {string} socialTelegramUrl
 * @property {string} socialInstagramUrl
 * @property {string} socialVkUrl
 * @property {string} socialYoutubeUrl
 * @property {string} socialWhatsappUrl
 * @property {string} socialWebsiteUrl
 * @property {'user'|'admin'|'moderator'} userRole
 * @property {string} userDiscountPercent
 * @property {string} userLoyaltyPoints
 * @property {string} premiumExpiresAt
 * @property {boolean} isActiveUser
 * @property {boolean} isUserDataConfirmed
 * @property {boolean} isBlockedUser
 * @property {boolean} userBusinessHoursEnabled
 * @property {number[]} userBusinessHoursWeekdays
 * @property {string} userBusinessHoursOpenTime
 * @property {string} userBusinessHoursCloseTime
 */

/**
 * @param {Partial<import('../model/types.js').UserPublicProfile>} user
 * @returns {EditProfileFormState}
 */
export function mapUserToEditProfileForm(user) {
  const birth = user.userBirthDate;
  const birthInput =
    typeof birth === "string" && birth.length >= 10 ? birth.slice(0, 10) : "";

  const { presetId, imageUrl } = parseUserBackgroundFormFields(user.userBackgroundUrl);

  /** @type {Record<string, string>} */
  const socialLinks = {};
  for (const fieldId of USER_SOCIAL_LINK_FIELD_IDS) {
    socialLinks[fieldId] = storedSocialUrlToInputValue(fieldId, user[fieldId]);
  }

  const savedAddresses = userSavedAddressesFromUser(user);

  return {
    userName: user.userName ?? "",
    userFullName: user.userFullName ?? "",
    email: typeof user.email === "string" ? user.email.trim().toLowerCase() : "",
    userBirthDate: birthInput,
    userGender: user.userGender ?? USER_GENDER_NO_SELECTED,
    savedAddresses,
    userRegionCode: isRuRegionCode(String(user.userRegionCode ?? "").trim())
      ? String(user.userRegionCode).trim()
      : DEFAULT_VIEWER_REGION_CODE,
    userPhoneNumber: maskRuPhoneInput(user.userPhoneNumber ?? ""),
    userAvatarUrl: user.userAvatarUrl ?? DEFAULT_USER_AVATAR_URL,
    userAvatarFocus: getUserAvatarFocus(user),
    backgroundPresetId: presetId || DEFAULT_USER_BACKGROUND_PRESET_ID,
    backgroundImageUrl: imageUrl,
    userBackgroundFocus: getUserBackgroundFocus(user),
    notificationsEnabled: Boolean(user.notificationsEnabled),
    notesAboutUser: user.notesAboutUser ?? "",
    ...socialLinks,
    userRole: user.userRole ?? USER_ROLE_USER,
    userDiscountPercent:
      user.userDiscountPercent != null ? String(user.userDiscountPercent) : "0",
    userLoyaltyPoints:
      user.userLoyaltyPoints != null ? String(user.userLoyaltyPoints) : "0",
    premiumExpiresAt: formatPremiumExpiresAtForInput(user.premiumExpiresAt),
    isActiveUser: user.isActiveUser !== false,
    isUserDataConfirmed: user.isUserDataConfirmed === true,
    isBlockedUser: Boolean(user.isBlockedUser),
    ...mapUserBusinessHoursFromUser(user),
  };
}
