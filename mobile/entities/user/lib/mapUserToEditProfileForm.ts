import { USER_SOCIAL_LINK_FIELD_IDS, storedSocialUrlToInputValue, DEFAULT_VIEWER_REGION_CODE, isRuRegionCode } from "@molha/api-contract";
import { addressValueFromUser } from "@/entities/address/lib/addressValueFromUser";
import type { RuDeliveryAddressValue } from "@/entities/address/model/types";
import type { UserSavedAddressFormValue } from "@/entities/address/model/userSavedAddressTypes";
import { userSavedAddressesFromUser } from "@/entities/address/lib/userSavedAddressesFromUser";
import { formatBirthDateForInput } from "@/entities/user/lib/birthDateInputMask";
import { getUserBackgroundFocus } from "@/entities/user/lib/profileImageFocus";
import type { ProfileImageFocus } from "@/entities/user/lib/profileImageFocus";
import { maskRuPhoneInput } from "@/entities/user/lib/ruPhone";
import {
  parseUserBackgroundFormFields,
  resolveBackgroundModeFromUser,
  type BackgroundMode,
} from "@/entities/user/lib/userBackgroundValue";
import { mapUserBusinessHoursFromUser } from "./userBusinessHoursForm";
import { DEFAULT_USER_AVATAR_URL, USER_GENDER_NO_SELECTED } from "@/entities/user/model/constants";
import { DEFAULT_USER_BACKGROUND_PRESET_ID } from "@/entities/user/model/userBackgroundPresets";

export type EditProfileFormState = {
  userName: string;
  userFullName: string;
  userBusinessHoursEnabled: boolean;
  userBusinessHoursWeekdays: number[];
  userBusinessHoursOpenTime: string;
  userBusinessHoursCloseTime: string;
  email: string;
  userBirthDate: string;
  userGender: "male" | "female" | "noSelected";
  deliveryAddress: RuDeliveryAddressValue;
  savedAddresses: UserSavedAddressFormValue[];
  userRegionCode: string;
  userPhoneNumber: string;
  userAvatarUrl: string;
  backgroundMode: BackgroundMode;
  backgroundPresetId: string;
  backgroundImageUrl: string;
  userBackgroundFocus: ProfileImageFocus;
  notificationsEnabled: boolean;
  notesAboutUser: string;
  socialTelegramUrl: string;
  socialInstagramUrl: string;
  socialVkUrl: string;
  socialYoutubeUrl: string;
  socialWhatsappUrl: string;
  socialWebsiteUrl: string;
};

export const EMPTY_DELIVERY_ADDRESS: RuDeliveryAddressValue = {
  line: "",
  flat: "",
  fiasId: "",
  geo: null,
  regionCode: null,
  selectedFromSuggest: false,
};

/** @deprecated alias — kept for transitional imports */
export type StructuredAddress = {
  city: string;
  district: string;
  street: string;
  house: string;
  flat: string;
};

/** @deprecated */
export const EMPTY_STRUCTURED_ADDRESS: StructuredAddress = {
  city: "",
  district: "",
  street: "",
  house: "",
  flat: "",
};

export const mapUserToEditProfileForm = (
  user: Record<string, unknown>,
): EditProfileFormState => {
  const stored = typeof user.userBackgroundUrl === "string" ? user.userBackgroundUrl : null;
  const bgFields = parseUserBackgroundFormFields(stored);
  const bgMode = resolveBackgroundModeFromUser(stored);
  const regionRaw =
    typeof user.userRegionCode === "string" ? user.userRegionCode.trim() : "";

  const socialLinks = Object.fromEntries(
    USER_SOCIAL_LINK_FIELD_IDS.map((fieldId) => [
      fieldId,
      storedSocialUrlToInputValue(fieldId, user[fieldId]),
    ]),
  ) as Pick<
    EditProfileFormState,
    | "socialTelegramUrl"
    | "socialInstagramUrl"
    | "socialVkUrl"
    | "socialYoutubeUrl"
    | "socialWhatsappUrl"
    | "socialWebsiteUrl"
  >;

  const deliveryAddress = addressValueFromUser(user);
  deliveryAddress.flat =
    typeof user.userAddressFlat === "string" ? user.userAddressFlat.trim() : "";

  return {
    userName: typeof user.userName === "string" ? user.userName : "",
    userFullName: typeof user.userFullName === "string" ? user.userFullName : "",
    ...mapUserBusinessHoursFromUser(user),
    email: typeof user.email === "string" ? user.email.trim().toLowerCase() : "",
    userBirthDate: formatBirthDateForInput(user.userBirthDate),
    userGender:
      user.userGender === "male" || user.userGender === "female"
        ? user.userGender
        : USER_GENDER_NO_SELECTED,
    deliveryAddress,
    savedAddresses: userSavedAddressesFromUser(user),
    userRegionCode: isRuRegionCode(regionRaw) ? regionRaw : DEFAULT_VIEWER_REGION_CODE,
    userPhoneNumber:
      typeof user.userPhoneNumber === "string"
        ? maskRuPhoneInput(user.userPhoneNumber)
        : "",
    userAvatarUrl:
      typeof user.userAvatarUrl === "string" && user.userAvatarUrl.trim()
        ? user.userAvatarUrl
        : DEFAULT_USER_AVATAR_URL,
    backgroundMode: bgMode,
    backgroundPresetId: bgFields.presetId || DEFAULT_USER_BACKGROUND_PRESET_ID,
    backgroundImageUrl: bgFields.imageUrl,
    userBackgroundFocus: getUserBackgroundFocus(user),
    notificationsEnabled: user.notificationsEnabled !== false,
    notesAboutUser: typeof user.notesAboutUser === "string" ? user.notesAboutUser : "",
    ...socialLinks,
  };
};
