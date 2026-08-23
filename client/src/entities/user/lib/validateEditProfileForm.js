import { validateUserSavedAddressesForm } from "../../address/lib/validateUserSavedAddressesForm.js";
import { isStoredUploadOrHttpImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { validateSocialLinksInForm } from "./buildPatchUserProfileBody.js";
import { validateRuPhoneField } from "./ruPhone.js";
import {
  NOTES_ABOUT_USER_MAX_CHARS,
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
  USER_ROLE_USER,
} from "../model/userConstants.js";
import { isUserBackgroundPresetId } from "../model/userBackgroundPresets.js";
import { assertUserNameFormat, isRuRegionCode } from "@molha/api-contract";
import { EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";

const DISCOUNT_MIN = 0;
const DISCOUNT_MAX = 100;

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
    try {
      assertUserNameFormat(name);
    } catch (error) {
      return error instanceof Error ? error.message : "Неверный никнейм";
    }
  }

  const phoneError = validateRuPhoneField(form.userPhoneNumber);
  if (phoneError) return phoneError;

  const addressError = validateUserSavedAddressesForm(form.savedAddresses);
  if (addressError) return addressError;

  if (!isRuRegionCode(form.userRegionCode)) {
    return EDIT_PROFILE_MODAL_UI.ERROR_REGION_REQUIRED;
  }

  if (String(form.notesAboutUser).length > NOTES_ABOUT_USER_MAX_CHARS) {
    return `О себе: не больше ${NOTES_ABOUT_USER_MAX_CHARS} символов`;
  }

  const socialError = validateSocialLinksInForm(form);
  if (socialError) return socialError;

  const av = String(form.userAvatarUrl).trim();
  if (av !== "" && !isStoredUploadOrHttpImageUrl(av)) {
    return "Некорректный URL аватара (http(s):// или /uploads/...)";
  }

  if (backgroundMode === "image") {
    const imageUrl = String(form.backgroundImageUrl ?? "").trim();
    if (imageUrl !== "" && !isStoredUploadOrHttpImageUrl(imageUrl)) {
      return "Укажите корректный URL фона (http(s):// или /uploads/...)";
    }
  } else if (backgroundMode === "admin") {
    const imageUrl = String(form.backgroundImageUrl ?? "").trim();
    if (imageUrl !== "" && !isStoredUploadOrHttpImageUrl(imageUrl)) {
      return "Некорректный URL фона (http(s):// или /uploads/...)";
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
    const loyaltyPoints = Math.floor(Number(String(form.userLoyaltyPoints).trim()));
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
