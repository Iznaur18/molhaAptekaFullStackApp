import {
  USER_SOCIAL_LINK_FIELD_IDS,
  normalizeSocialLinkToStoredUrl,
  validateSocialLinkInput,
  isRuRegionCode,
} from "@molha/api-contract";
import { normalizeUploadUrlForStorage } from "@izibuy/shared-lib";
import { getUserAvatarFocus, getUserBackgroundFocus } from "./profileImageFocus.js";
import { serializeUserBackgroundForForm } from "./userBackgroundValue.js";
import { DEFAULT_USER_AVATAR_URL } from "../model/userConstants.js";
import { appendUserAddressesToPayload } from "../../address/lib/appendUserAddressesToPayload.js";
import { isUserSavedAddressesEqual } from "../../address/lib/isUserSavedAddressesEqual.js";
import { buildUserBusinessHoursPatchBody } from "./userBusinessHoursForm.js";

/**
 * Тело `PATCH /user/:id` (только разрешённые пользователю поля).
 *
 * @param {import('./mapUserToEditProfileForm.js').EditProfileFormState} form
 * @param {{ backgroundMode?: 'preset' | 'image' | 'admin'; includePremium?: boolean; includeLoyaltyPoints?: boolean; initialPhoneNumber?: string | null; initialSavedAddresses?: import('../../address/model/userSavedAddressTypes.js').UserSavedAddressFormValue[] }} [options]
 * @returns {Record<string, unknown>}
 */
export function buildPatchUserProfileBody(form, options = {}) {
  const {
    backgroundMode = "preset",
    includePremium = false,
    includeLoyaltyPoints = false,
    initialPhoneNumber = "",
    initialSavedAddresses = [],
  } = options;
  const body = {};

  const rawName = String(form.userName).trim().toLowerCase();
  if (rawName.length > 0) {
    body.userName = rawName;
  }

  const rawFullName = String(form.userFullName).trim().replace(/\s+/g, " ");
  body.userFullName = rawFullName === "" ? null : rawFullName;

  // Пустая строка — это «убрать реквизиты», а не «не трогать»: продавец
  // должен иметь возможность их стереть.
  body.sellerPayoutRequisites = String(form.sellerPayoutRequisites ?? "").trim();

  Object.assign(body, buildUserBusinessHoursPatchBody(form));

  if (form.userBirthDate === "") {
    body.userBirthDate = null;
  } else if (form.userBirthDate) {
    const raw = String(form.userBirthDate).trim();
    const dotted = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(raw);
    const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    let ymd = null;
    if (dotted) {
      ymd = `${dotted[3]}-${dotted[2]}-${dotted[1]}`;
    } else if (isoDay) {
      ymd = raw;
    } else if (raw.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
      ymd = raw.slice(0, 10);
    }
    if (!ymd) {
      throw new Error("Дата рождения: ДД.ММ.ГГГГ");
    }
    const probe = new Date(`${ymd}T12:00:00.000Z`);
    if (Number.isNaN(probe.getTime())) {
      throw new Error("Дата рождения: ДД.ММ.ГГГГ");
    }
    body.userBirthDate = `${ymd}T12:00:00.000Z`;
  }

  body.userGender = form.userGender;

  const addressBaseline = Array.isArray(initialSavedAddresses) ? initialSavedAddresses : [];
  if (!isUserSavedAddressesEqual(form.savedAddresses, addressBaseline)) {
    appendUserAddressesToPayload(body, form.savedAddresses);
  }

  const regionCode = String(form.userRegionCode ?? "").trim();
  if (isRuRegionCode(regionCode)) {
    body.userRegionCode = regionCode;
  }

  // Телефон владельца — только через /auth/phone/bind/* (не через PATCH).

  const av = normalizeUploadUrlForStorage(String(form.userAvatarUrl).trim());
  body.userAvatarUrl = av === "" ? DEFAULT_USER_AVATAR_URL : av;
  body.userAvatarFocus = getUserAvatarFocus({
    userAvatarFocus: form.userAvatarFocus,
  });

  if (backgroundMode === "image") {
    const imageUrl = normalizeUploadUrlForStorage(
      String(form.backgroundImageUrl ?? "").trim(),
    );
    if (imageUrl !== "") {
      body.userBackgroundUrl = serializeUserBackgroundForForm("image", {
        presetId: form.backgroundPresetId,
        imageUrl,
      });
    }
  } else {
    body.userBackgroundUrl = serializeUserBackgroundForForm(backgroundMode, {
      presetId: form.backgroundPresetId,
      imageUrl: normalizeUploadUrlForStorage(String(form.backgroundImageUrl ?? "").trim()),
    });
  }

  body.userBackgroundFocus = getUserBackgroundFocus({
    userBackgroundFocus: form.userBackgroundFocus,
  });

  body.notificationsEnabled = Boolean(form.notificationsEnabled);

  const notes = String(form.notesAboutUser).trim();
  body.notesAboutUser = notes === "" ? null : notes;

  for (const fieldId of USER_SOCIAL_LINK_FIELD_IDS) {
    const link = String(form[fieldId] ?? "").trim();
    if (link === "") {
      body[fieldId] = null;
      continue;
    }
    const normalized = normalizeSocialLinkToStoredUrl(fieldId, link);
    if (!normalized.ok) {
      throw new Error(normalized.message);
    }
    // API ждёт ник/телефон (не готовый https) — нормализацию делает `updateProfileBodySchema`.
    body[fieldId] = link;
  }

  if (includePremium) {
    const premiumExpiresAtRaw = String(form.premiumExpiresAt ?? "").trim();
    body.premiumExpiresAt =
      premiumExpiresAtRaw === "" ? null : new Date(premiumExpiresAtRaw).toISOString();
  }

  if (includeLoyaltyPoints) {
    const loyaltyPoints = Math.floor(Number(String(form.userLoyaltyPoints).trim()));
    body.userLoyaltyPoints =
      Number.isFinite(loyaltyPoints) && loyaltyPoints >= 0 ? loyaltyPoints : 0;
  }

  return body;
}

/**
 * @param {import('./mapUserToEditProfileForm.js').EditProfileFormState} form
 * @returns {string | null}
 */
export function validateSocialLinksInForm(form) {
  for (const fieldId of USER_SOCIAL_LINK_FIELD_IDS) {
    const error = validateSocialLinkInput(fieldId, form[fieldId]);
    if (error) return error;
  }
  return null;
}
