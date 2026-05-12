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

  const addr = String(form.userAddress).trim();
  body.userAddress = addr === "" ? null : addr;

  const phone = String(form.userPhoneNumber).trim();
  body.userPhoneNumber = phone === "" ? null : phone;

  const av = String(form.userAvatarUrl).trim();
  body.userAvatarUrl = av === "" ? DEFAULT_USER_AVATAR_URL : av;

  const bg = String(form.userBackgroundUrl).trim();
  body.userBackgroundUrl = bg === "" ? DEFAULT_USER_BACKGROUND_URL : bg;

  body.notificationsEnabled = Boolean(form.notificationsEnabled);

  const notes = String(form.notesAboutUser).trim();
  body.notesAboutUser = notes === "" ? null : notes;

  return body;
}
