import { validateRuDeliveryAddressForm } from "../../address/lib/validateRuDeliveryAddressForm.js";
import { countWords } from "./countWords.js";
import { validateRuPhoneField } from "./ruPhone.js";import {
  PROFILE_FIELD_MAX_WORDS,
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
  USER_ROLE_USER,
} from "../model/userConstants.js";

const DISCOUNT_MIN = 0;
const DISCOUNT_MAX = 100;

const USER_NAME_PATTERN = /^[a-z0-9]+$/;

/**
 * @param {import('./mapUserToEditProfileForm.js').EditProfileFormState} form
 * @param {{ includeAdmin?: boolean }} [options]
 * @returns {string | null} сообщение об ошибке или null
 */
export function validateEditProfileForm(form, options = {}) {
  const { includeAdmin = false } = options;
  const name = String(form.userName).trim().toLowerCase();
  if (name.length > 0) {
    if (name.length < USER_NAME_MIN_LENGTH || name.length > USER_NAME_MAX_LENGTH) {
      return `Никнейм: от ${USER_NAME_MIN_LENGTH} до ${USER_NAME_MAX_LENGTH} символов`;
    }
    if (!USER_NAME_PATTERN.test(name)) {
      return "Никнейм: только a–z и 0–9, без пробелов";
    }
  }

  const phoneError = validateRuPhoneField(form.userPhoneNumber);
  if (phoneError) return phoneError;

  const addressLine = String(form.deliveryAddress.line ?? "").trim();
  const addressFlat = String(form.deliveryAddress.flat ?? "").trim();
  if (addressLine || addressFlat) {
    const addressError = validateRuDeliveryAddressForm(form.deliveryAddress);
    if (addressError) return addressError;
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

  if (includeAdmin) {
    const role = form.userRole;
    if (
      role !== USER_ROLE_USER &&
      role !== USER_ROLE_ADMIN &&
      role !== USER_ROLE_MODERATOR
    ) {
      return "Некорректная роль";
    }

    const discount = Number(String(form.userDiscountPercent).trim());
    if (
      !Number.isFinite(discount) ||
      discount < DISCOUNT_MIN ||
      discount > DISCOUNT_MAX
    ) {
      return `Скидка: число от ${DISCOUNT_MIN} до ${DISCOUNT_MAX}`;
    }
  }

  return null;
}
