import {
  USER_SOCIAL_LINK_FIELD_IDS,
  isHttpUrl,
} from "@molha/api-contract";
import {
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_NAME_PATTERN,
} from "@/entities/user/model/constants";

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

  const phoneError = validateRuPhoneField(form.userPhoneNumber);
  if (phoneError) return phoneError;

  for (const fieldId of USER_SOCIAL_LINK_FIELD_IDS) {
    const link = form[fieldId].trim();
    if (link === "") continue;
    if (!isHttpUrl(link)) {
      return "Соцсети: укажите корректную ссылку (http:// или https://)";
    }
  }

  return null;
};
