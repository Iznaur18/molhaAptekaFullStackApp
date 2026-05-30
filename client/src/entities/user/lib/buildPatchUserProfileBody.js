import { appendRuAddressToPayload } from "../../address/lib/appendRuAddressToPayload.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { normalizeRuPhoneInput } from "./ruPhone.js";
import {
  getUserAvatarFocus,
  getUserBackgroundFocus,
} from "./profileImageFocus.js";
import { serializeUserBackgroundForForm } from "./userBackgroundValue.js";
import { DEFAULT_USER_AVATAR_URL } from "../model/userConstants.js";

/**
 * Тело `PATCH /user/:id` (только разрешённые пользователю поля).
 *
 * @param {import('./mapUserToEditProfileForm.js').EditProfileFormState} form
 * @param {{ backgroundMode?: 'preset' | 'image' | 'admin'; includePremium?: boolean; initialPhoneNumber?: string | null }} [options]
 * @returns {Record<string, unknown>}
 */
export function buildPatchUserProfileBody(form, options = {}) {
  const {
    backgroundMode = "preset",
    includePremium = false,
    initialPhoneNumber = "",
  } = options;
  const body = {};

  const rawName = String(form.userName).trim().toLowerCase();
  if (rawName.length > 0) {
    body.userName = rawName;
  }

  if (form.userBirthDate === "") {
    body.userBirthDate = null;
  } else if (form.userBirthDate) {
    const iso = new Date(`${form.userBirthDate}T12:00:00.000Z`).toISOString();
    body.userBirthDate = iso;
  }

  body.userGender = form.userGender;

  const line = String(form.deliveryAddress.line ?? "").trim();
  const flat = String(form.deliveryAddress.flat ?? "").trim();
  if (line === "" && flat === "") {
    body.userAddress = null;
    body.userAddressFlat = null;
  } else {
    appendRuAddressToPayload(body, form.deliveryAddress);
  }

  const phoneRaw = String(form.userPhoneNumber).trim();
  const initialPhone = String(initialPhoneNumber ?? "").trim();
  if (phoneRaw !== "") {
    body.userPhoneNumber = normalizeRuPhoneInput(phoneRaw);
  } else if (initialPhone !== "") {
    body.userPhoneNumber = null;
  }

  const av = resolveUploadedImageUrl(String(form.userAvatarUrl).trim());
  body.userAvatarUrl = av === "" ? DEFAULT_USER_AVATAR_URL : av;
  body.userAvatarFocus = getUserAvatarFocus({
    userAvatarFocus: form.userAvatarFocus,
  });

  if (backgroundMode === "image") {
    const imageUrl = resolveUploadedImageUrl(
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
      imageUrl: resolveUploadedImageUrl(String(form.backgroundImageUrl ?? "").trim()),
    });
  }

  body.userBackgroundFocus = getUserBackgroundFocus({
    userBackgroundFocus: form.userBackgroundFocus,
  });

  body.notificationsEnabled = Boolean(form.notificationsEnabled);

  const notes = String(form.notesAboutUser).trim();
  body.notesAboutUser = notes === "" ? null : notes;

  if (includePremium) {
    body.isPremiumUser = Boolean(form.isPremiumUser);
  }

  return body;
}
