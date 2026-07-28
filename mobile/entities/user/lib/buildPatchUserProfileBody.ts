import {
  USER_SOCIAL_LINK_FIELD_IDS,
  normalizeSocialLinkToStoredUrl,
  validateSocialLinkInput,
  isRuRegionCode,
} from "@molha/api-contract";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { normalizeUploadUrlForStorage } from "@/shared/lib";

import {
  birthDateIsoDateToApiValue,
  parseBirthDateInputToIsoDate,
} from "./birthDateInputMask";
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
    const isoDate = parseBirthDateInputToIsoDate(form.userBirthDate);
    if (isoDate) {
      body.userBirthDate = birthDateIsoDateToApiValue(isoDate);
    }
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

  if (
    form.userRegionCode !== initial.userRegionCode &&
    isRuRegionCode(form.userRegionCode)
  ) {
    body.userRegionCode = form.userRegionCode;
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

  for (const fieldId of USER_SOCIAL_LINK_FIELD_IDS as readonly Extract<
    keyof EditProfileFormState,
    `social${string}`
  >[]) {
    const next = form[fieldId].trim();
    const prev = initial[fieldId].trim();
    if (next === prev) continue;
    if (next === "") {
      body[fieldId] = null;
      continue;
    }
    const normalized = normalizeSocialLinkToStoredUrl(fieldId, next);
    if (!normalized.ok) {
      throw new Error(normalized.message);
    }
    // API ждёт ник/телефон (не готовый https) — нормализацию делает серверный schema.
    body[fieldId] = next;
  }

  return body;
};
