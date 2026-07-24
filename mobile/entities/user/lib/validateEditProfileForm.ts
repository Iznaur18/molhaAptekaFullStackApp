import {
  USER_SOCIAL_LINK_FIELD_IDS,
  validateSocialLinkInput,
} from "@molha/api-contract";
import {
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_NAME_PATTERN,
} from "@/entities/user/model/constants";

import { isBirthDateInputComplete, parseBirthDateInputToIsoDate } from "./birthDateInputMask";
import { validateRuPhoneField } from "./ruPhone";
import type { EditProfileFormState } from "./mapUserToEditProfileForm";

export const validateEditProfileForm = (form: EditProfileFormState): string | null => {
  const name = form.userName.trim().toLowerCase();
  if (name.length > 0) {
    if (name.length < USER_NAME_MIN_LENGTH || name.length > USER_NAME_MAX_LENGTH) {
      return `Никнейм: от ${USER_NAME_MIN_LENGTH} до ${USER_NAME_MAX_LENGTH} символов`;
    }
    if (!USER_NAME_PATTERN.test(name)) {
      return "Никнейм: только a–z и 0–9, без пробелов";
    }
  }

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

  for (const fieldId of USER_SOCIAL_LINK_FIELD_IDS as readonly Extract<
    keyof EditProfileFormState,
    `social${string}`
  >[]) {
    const error = validateSocialLinkInput(fieldId, form[fieldId]);
    if (error) return error;
  }

  return null;
};
