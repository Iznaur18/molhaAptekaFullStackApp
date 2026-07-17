import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { normalizeUploadUrlForStorage } from "@/shared/lib";

import { getUserBackgroundFocus } from "./profileImageFocus";
import { normalizeRuPhoneInput } from "./ruPhone";
import { EMPTY_STRUCTURED_ADDRESS, type EditProfileFormState } from "./mapUserToEditProfileForm";
import { serializeUserBackground } from "./userBackgroundValue";

const isAddressEmpty = (a: EditProfileFormState["structuredAddress"]) =>
  !a.city && !a.district && !a.street && !a.house && !a.flat;

const isAddressEqual = (
  a: EditProfileFormState["structuredAddress"],
  b: EditProfileFormState["structuredAddress"],
) =>
  a.city === b.city &&
  a.district === b.district &&
  a.street === b.street &&
  a.house === b.house &&
  a.flat === b.flat;

export const buildPatchUserProfileBody = (
  form: EditProfileFormState,
  initial: EditProfileFormState,
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  const rawName = form.userName.trim().toLowerCase();
  const initialName = initial.userName.trim().toLowerCase();
  if (rawName.length > 0 && rawName !== initialName) {
    body.userName = rawName;
  }

  if (form.userBirthDate === "") {
    if (initial.userBirthDate !== "") {
      body.userBirthDate = null;
    }
  } else if (form.userBirthDate !== initial.userBirthDate) {
    body.userBirthDate = new Date(`${form.userBirthDate}T12:00:00.000Z`).toISOString();
  }

  if (form.userGender !== initial.userGender) {
    body.userGender = form.userGender;
  }

  const baseline = initial.structuredAddress ?? EMPTY_STRUCTURED_ADDRESS;
  if (!isAddressEqual(form.structuredAddress, baseline)) {
    if (isAddressEmpty(form.structuredAddress)) {
      body.userAddressCity = null;
      body.userAddressDistrict = null;
      body.userAddressStreet = null;
      body.userAddressHouse = null;
      body.userAddressFlat = null;
      body.userAddress = null;
    } else {
      body.userAddressCity = form.structuredAddress.city;
      body.userAddressDistrict = form.structuredAddress.district || null;
      body.userAddressStreet = form.structuredAddress.street;
      body.userAddressHouse = form.structuredAddress.house;
      body.userAddressFlat = form.structuredAddress.flat || null;
    }
  }

  const phoneRaw = form.userPhoneNumber.trim();
  const initialPhone = initial.userPhoneNumber.trim();
  if (phoneRaw !== "") {
    body.userPhoneNumber = normalizeRuPhoneInput(phoneRaw);
  } else if (initialPhone !== "") {
    body.userPhoneNumber = null;
  }

  if (form.notificationsEnabled !== initial.notificationsEnabled) {
    body.notificationsEnabled = form.notificationsEnabled;
  }

  const avatarUrl = normalizeUploadUrlForStorage(form.userAvatarUrl);
  const initialAvatarUrl = normalizeUploadUrlForStorage(initial.userAvatarUrl);
  if (avatarUrl !== initialAvatarUrl) {
    body.userAvatarUrl = avatarUrl === "" ? DEFAULT_USER_AVATAR_URL : avatarUrl;
  }

  const bgChanged =
    form.backgroundMode !== initial.backgroundMode ||
    form.backgroundPresetId !== initial.backgroundPresetId ||
    form.backgroundImageUrl !== initial.backgroundImageUrl;
  if (bgChanged) {
    try {
      body.userBackgroundUrl = serializeUserBackground(form.backgroundMode, {
        presetId: form.backgroundPresetId,
        imageUrl: form.backgroundImageUrl,
      });
    } catch {
      // skip if not yet valid (e.g. image mode with empty url)
    }
  }

  const nextBackgroundFocus = getUserBackgroundFocus({
    userBackgroundFocus: form.userBackgroundFocus,
  });
  const initialBackgroundFocus = getUserBackgroundFocus({
    userBackgroundFocus: initial.userBackgroundFocus,
  });
  if (
    nextBackgroundFocus.x !== initialBackgroundFocus.x ||
    nextBackgroundFocus.y !== initialBackgroundFocus.y
  ) {
    body.userBackgroundFocus = nextBackgroundFocus;
  }

  const notes = form.notesAboutUser.trim();
  const initialNotes = initial.notesAboutUser.trim();
  if (notes !== initialNotes) {
    body.notesAboutUser = notes === "" ? null : notes;
  }

  return body;
};
