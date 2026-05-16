import { appendRuAddressToPayload } from "../../address/lib/appendRuAddressToPayload.js";
import { normalizeRuPhoneInput } from "./ruPhone.js";
import {
  DEFAULT_USER_AVATAR_URL,
  DEFAULT_USER_BACKGROUND_URL,
} from "../model/userConstants.js";

/**
 * Тело `PATCH /user/:id` (только разрешённые пользователю поля).
 *
 * @param {import('./mapUserToEditProfileForm.js').EditProfileFormState} form
 * @returns {Record<string, unknown>}
 */
export function buildPatchUserProfileBody(form) {
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
  if (phoneRaw === "") {
    body.userPhoneNumber = null;
  } else {
    body.userPhoneNumber = normalizeRuPhoneInput(phoneRaw);
  }

  const av = String(form.userAvatarUrl).trim();
  body.userAvatarUrl = av === "" ? DEFAULT_USER_AVATAR_URL : av;

  const bg = String(form.userBackgroundUrl).trim();
  body.userBackgroundUrl = bg === "" ? DEFAULT_USER_BACKGROUND_URL : bg;

  body.notificationsEnabled = Boolean(form.notificationsEnabled);

  const notes = String(form.notesAboutUser).trim();
  body.notesAboutUser = notes === "" ? null : notes;

  return body;
}
