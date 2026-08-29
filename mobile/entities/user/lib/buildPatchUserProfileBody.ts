import {
  USER_SOCIAL_LINK_FIELD_IDS,
  normalizeSocialLinkToStoredUrl,
  validateSocialLinkInput,
  isRuRegionCode,
} from "@molha/api-contract";
import { appendUserAddressesToPayload } from "@/entities/address/lib/appendUserAddressesToPayload";
import { isUserSavedAddressesEqual } from "@/entities/address/lib/isUserSavedAddressesEqual";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { normalizeUploadUrlForStorage } from "@/shared/lib";

import { buildUserBusinessHoursPatchBody } from "@/entities/user/lib/userBusinessHoursForm";
import { getUserBackgroundFocus } from "./profileImageFocus";
import type { EditProfileFormState } from "./mapUserToEditProfileForm";
import { serializeUserBackground } from "./userBackgroundValue";

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

  const rawFullName = form.userFullName.trim().replace(/\s+/g, " ");
  const initialFullName = initial.userFullName.trim().replace(/\s+/g, " ");
  if (rawFullName !== initialFullName) {
    body.userFullName = rawFullName === "" ? null : rawFullName;
  }

  const businessHoursBody = buildUserBusinessHoursPatchBody(form);
  const initialBusinessHoursBody = buildUserBusinessHoursPatchBody(initial);
  if (JSON.stringify(businessHoursBody) !== JSON.stringify(initialBusinessHoursBody)) {
    Object.assign(body, businessHoursBody);
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

  // Легаси-поле `userAddress` из формы профиля больше не уходит: адрес задаётся
  // книгой адресов, а сервер сам переносит адрес по умолчанию в userAddress*.
  // Контракт запрещает слать userAddress и userAddresses одним запросом
  // (USER_ADDRESS_PATCH_CONFLICT_MESSAGE) — в вебе поля тоже нет.

  // Книга адресов уходит целиком: сервер заменяет список, а не патчит по одному.
  if (!isUserSavedAddressesEqual(form.savedAddresses, initial.savedAddresses)) {
    appendUserAddressesToPayload(body, form.savedAddresses);
  }

  if (
    form.userRegionCode !== initial.userRegionCode &&
    isRuRegionCode(form.userRegionCode)
  ) {
    body.userRegionCode = form.userRegionCode;
  }

  // Телефон владельца — только через /auth/phone/bind/* (не через PATCH).

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
