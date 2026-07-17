import { getUserBackgroundFocus } from "@/entities/user/lib/profileImageFocus";
import { DEFAULT_USER_AVATAR_URL, USER_GENDER_NO_SELECTED } from "@/entities/user/model/constants";
import { DEFAULT_USER_BACKGROUND_PRESET_ID } from "@/entities/user/model/userBackgroundPresets";
import {
  parseUserBackgroundFormFields,
  resolveBackgroundModeFromUser,
  type BackgroundMode,
} from "@/entities/user/lib/userBackgroundValue";
import type { ProfileImageFocus } from "@/entities/user/lib/profileImageFocus";

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
  const birth = user.userBirthDate;
  const birthInput =
    typeof birth === "string" && birth.length >= 10 ? birth.slice(0, 10) : "";

  const city = typeof user.userAddressCity === "string" ? user.userAddressCity.trim() : "";
  const stored = typeof user.userBackgroundUrl === "string" ? user.userBackgroundUrl : null;
  const bgFields = parseUserBackgroundFormFields(stored);
  const bgMode = resolveBackgroundModeFromUser(stored);

  return {
    userName: typeof user.userName === "string" ? user.userName : "",
    userBirthDate: birthInput,
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
    userPhoneNumber: typeof user.userPhoneNumber === "string" ? user.userPhoneNumber : "",
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
  };
};
