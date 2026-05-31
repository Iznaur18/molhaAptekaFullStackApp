import { validateRuDeliveryAddressForm } from "../../address/lib/validateRuDeliveryAddressForm.js";
import { validateRuPhoneField } from "./ruPhone.js";
import {
  NOTES_ABOUT_USER_MAX_CHARS,
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
  USER_ROLE_USER,
} from "../model/userConstants.js";
import { isHttpBackgroundImageUrl } from "./userBackgroundValue.js";
import { isUserBackgroundPresetId } from "../model/userBackgroundPresets.js";

const DISCOUNT_MIN = 0;
const DISCOUNT_MAX = 100;

const USER_NAME_PATTERN = /^[a-z0-9]+$/;

/**
 * @param {import('./mapUserToEditProfileForm.js').EditProfileFormState} form
 * @param {{ includeAdmin?: boolean; includeLoyaltyPoints?: boolean; backgroundMode?: 'preset' | 'image' | 'admin' }} [options]
 * @returns {string | null} сообщение об ошибке или null
 */
export function validateEditProfileForm(form, options = {}) {
  const {
    includeAdmin = false,
    includeLoyaltyPoints = false,
    backgroundMode = "preset",
  } = options;
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
  if (String(form.notesAboutUser).length > NOTES_ABOUT_USER_MAX_CHARS) {
    return `Заметки: не больше ${NOTES_ABOUT_USER_MAX_CHARS} символов`;
  }

  const av = String(form.userAvatarUrl).trim();
  if (av !== "") {
    try {
      void new URL(av);
    } catch {
      return "Некорректный URL аватара";
    }
  }

  if (backgroundMode === "image") {
    const imageUrl = String(form.backgroundImageUrl ?? "").trim();
    if (imageUrl !== "" && !isHttpBackgroundImageUrl(imageUrl)) {
      return "Укажите корректный URL фона (http или https)";
    }
  } else if (backgroundMode === "admin") {
    const imageUrl = String(form.backgroundImageUrl ?? "").trim();
    if (imageUrl !== "" && !isHttpBackgroundImageUrl(imageUrl)) {
      return "Некорректный URL фона";
    }
    if (imageUrl === "" && !isUserBackgroundPresetId(form.backgroundPresetId)) {
      return "Выберите цвет фона";
    }
  } else if (!isUserBackgroundPresetId(form.backgroundPresetId)) {
    return "Выберите цвет фона";
  }

  const gender = form.userGender;
  if (
    gender !== USER_GENDER_MALE &&
    gender !== USER_GENDER_FEMALE &&
    gender !== USER_GENDER_NO_SELECTED
  ) {
    return "Некорректное значение поля «пол»";
  }

  if (includeLoyaltyPoints || includeAdmin) {
    const loyaltyPoints = Math.floor(
      Number(String(form.userLoyaltyPoints).trim()),
    );
    if (!Number.isFinite(loyaltyPoints) || loyaltyPoints < 0) {
      return "Баллы лояльности: целое число не меньше 0";
    }
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
