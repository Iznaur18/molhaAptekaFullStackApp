import { USER_SOCIAL_LINK_FIELD_IDS, storedSocialUrlToInputValue } from "@molha/api-contract";
import { formatBirthDateForInput } from "@/entities/user/lib/birthDateInputMask";
import { getUserBackgroundFocus } from "@/entities/user/lib/profileImageFocus";
import type { ProfileImageFocus } from "@/entities/user/lib/profileImageFocus";
import { maskRuPhoneInput } from "@/entities/user/lib/ruPhone";
import {
  parseUserBackgroundFormFields,
  resolveBackgroundModeFromUser,
  type BackgroundMode,
} from "@/entities/user/lib/userBackgroundValue";
import { DEFAULT_USER_AVATAR_URL, USER_GENDER_NO_SELECTED } from "@/entities/user/model/constants";
import { DEFAULT_USER_BACKGROUND_PRESET_ID } from "@/entities/user/model/userBackgroundPresets";

export type StructuredAddress = {
  city: string;
  district: string;
  street: string;
  house: string;
  flat: string;
};

export type EditProfileFormState = {
  userName: string;
  userBirthDate: string;
  userGender: "male" | "female" | "noSelected";
  structuredAddress: StructuredAddress;
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
  const city = typeof user.userAddressCity === "string" ? user.userAddressCity.trim() : "";
  const stored = typeof user.userBackgroundUrl === "string" ? user.userBackgroundUrl : null;
  const bgFields = parseUserBackgroundFormFields(stored);
  const bgMode = resolveBackgroundModeFromUser(stored);

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

  return {
    userName: typeof user.userName === "string" ? user.userName : "",
    userBirthDate: formatBirthDateForInput(user.userBirthDate),
    userGender:
      user.userGender === "male" || user.userGender === "female"
        ? user.userGender
        : USER_GENDER_NO_SELECTED,
    structuredAddress: {
      city,
      district: typeof user.userAddressDistrict === "string" ? user.userAddressDistrict.trim() : "",
      street: typeof user.userAddressStreet === "string" ? user.userAddressStreet.trim() : "",
      house: typeof user.userAddressHouse === "string" ? user.userAddressHouse.trim() : "",
      flat: typeof user.userAddressFlat === "string" ? user.userAddressFlat.trim() : "",
    },
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
