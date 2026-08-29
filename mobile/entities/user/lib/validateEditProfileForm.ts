import {
  USER_SOCIAL_LINK_FIELD_IDS,
  validateSocialLinkInput,
  isRuRegionCode,
  assertUserNameFormat,
  USER_FULL_NAME_MAX_LENGTH,
} from "@molha/api-contract";
import { validateRuDeliveryAddressForm } from "@/entities/address/lib/validateRuDeliveryAddressForm";
import { validateUserSavedAddressesForm } from "@/entities/address/lib/validateUserSavedAddressesForm";
import { EDIT_PROFILE_UI } from "@/shared/config";
import { validateUserBusinessHoursForm } from "@/entities/user/lib/userBusinessHoursForm";

import { isBirthDateInputComplete, parseBirthDateInputToIsoDate } from "./birthDateInputMask";
import { validateRuPhoneField } from "./ruPhone";
import type { EditProfileFormState } from "./mapUserToEditProfileForm";

export const validateEditProfileForm = (form: EditProfileFormState): string | null => {
  const name = form.userName.trim().toLowerCase();
  if (name.length > 0) {
    try {
      assertUserNameFormat(name);
    } catch (error) {
      return error instanceof Error ? error.message : "Неверный никнейм";
    }
  }

  const fullName = form.userFullName.trim();
  if (fullName.length > USER_FULL_NAME_MAX_LENGTH) {
    return `Имя и фамилия: не больше ${USER_FULL_NAME_MAX_LENGTH} символов`;
  }

  const businessHoursError = validateUserBusinessHoursForm(form);
  if (businessHoursError) return businessHoursError;

  const birthDate = form.userBirthDate.trim();
  if (birthDate !== "") {
    if (!isBirthDateInputComplete(birthDate)) {
      return "Дата рождения: ДД.ММ.ГГГГ";
    }
    const isoDate = parseBirthDateInputToIsoDate(birthDate);
    if (isoDate && new Date(`${isoDate}T12:00:00.000Z`) > new Date()) {
      return "Дата рождения не может быть в будущем";
    }
  }

  const phoneError = validateRuPhoneField(form.userPhoneNumber);
  if (phoneError) return phoneError;

  const addressError = validateRuDeliveryAddressForm(form.deliveryAddress);
  if (addressError) return addressError;

  const savedAddressesError = validateUserSavedAddressesForm(form.savedAddresses);
  if (savedAddressesError) return savedAddressesError;

  if (!isRuRegionCode(form.userRegionCode)) {
    return EDIT_PROFILE_UI.ERROR_REGION_REQUIRED;
  }

  for (const fieldId of USER_SOCIAL_LINK_FIELD_IDS as readonly Extract<
    keyof EditProfileFormState,
    `social${string}`
  >[]) {
    const error = validateSocialLinkInput(fieldId, form[fieldId]);
    if (error) return error;
  }

  return null;
};
