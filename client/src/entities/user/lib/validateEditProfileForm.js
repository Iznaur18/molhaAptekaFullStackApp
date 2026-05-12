import { countWords } from "./countWords.js";
import {
  PROFILE_FIELD_MAX_WORDS,
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
} from "../model/userConstants.js";

const USER_NAME_PATTERN = /^[a-z0-9]+$/;

/**
 * @param {import('./mapUserToEditProfileForm.js').EditProfileFormState} form
 * @returns {string | null} сообщение об ошибке или null
 */
export function validateEditProfileForm(form) {
  const name = String(form.userName).trim().toLowerCase();
  if (name.length > 0) {
    if (name.length < USER_NAME_MIN_LENGTH || name.length > USER_NAME_MAX_LENGTH) {
      return `Никнейм: от ${USER_NAME_MIN_LENGTH} до ${USER_NAME_MAX_LENGTH} символов`;
    }
    if (!USER_NAME_PATTERN.test(name)) {
      return "Никнейм: только a–z и 0–9, без пробелов";
    }
  }

  if (countWords(form.userAddress) > PROFILE_FIELD_MAX_WORDS) {
    return `Адрес: не больше ${PROFILE_FIELD_MAX_WORDS} слов`;
  }
  if (countWords(form.notesAboutUser) > PROFILE_FIELD_MAX_WORDS) {
    return `Заметки: не больше ${PROFILE_FIELD_MAX_WORDS} слов`;
  }

  const av = String(form.userAvatarUrl).trim();
  if (av !== "") {
    try {
      void new URL(av);
    } catch {
      return "Некорректный URL аватара";
    }
  }

  const bg = String(form.userBackgroundUrl).trim();
  if (bg !== "") {
    try {
      void new URL(bg);
    } catch {
      return "Некорректный URL фона";
    }
  }

  const gender = form.userGender;
  if (
    gender !== USER_GENDER_MALE &&
    gender !== USER_GENDER_FEMALE &&
    gender !== USER_GENDER_NO_SELECTED
  ) {
    return "Некорректное значение поля «пол»";
  }

  return null;
}
