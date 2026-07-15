import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
  USER_ROLE_USER,
} from "@izibuy/shared-lib";

import type { AdminEditProfileFormState } from "./mapUserToAdminEditProfileForm";
import { NOTES_ABOUT_USER_MAX_CHARS } from "@/entities/user/model/constants";
import { validateEditProfileForm } from "./validateEditProfileForm";

const DISCOUNT_MIN = 0;
const DISCOUNT_MAX = 100;

type ValidateAdminEditProfileFormOptions = {
  includeRole: boolean;
};

export const validateAdminEditProfileForm = (
  form: AdminEditProfileFormState,
  options: ValidateAdminEditProfileFormOptions,
): string | null => {
  const baseError = validateEditProfileForm(form);
  if (baseError) {
    return baseError;
  }

  if (form.notesAboutUser.length > NOTES_ABOUT_USER_MAX_CHARS) {
    return `О себе: не больше ${NOTES_ABOUT_USER_MAX_CHARS} символов`;
  }

  const loyaltyPoints = Math.floor(Number(form.userLoyaltyPoints.trim()));
  if (!Number.isFinite(loyaltyPoints) || loyaltyPoints < 0) {
    return "Баллы лояльности: укажите неотрицательное число";
  }

  if (options.includeRole) {
    if (
      form.userRole !== USER_ROLE_USER &&
      form.userRole !== USER_ROLE_ADMIN &&
      form.userRole !== USER_ROLE_MODERATOR
    ) {
      return "Некорректная роль";
    }

    const discount = Number(form.userDiscountPercent.trim());
    if (
      !Number.isFinite(discount) ||
      discount < DISCOUNT_MIN ||
      discount > DISCOUNT_MAX
    ) {
      return `Скидка: от ${DISCOUNT_MIN} до ${DISCOUNT_MAX}%`;
    }
  }

  const premiumRaw = form.premiumExpiresAt.trim();
  if (premiumRaw !== "" && Number.isNaN(new Date(premiumRaw).getTime())) {
    return "Некорректная дата окончания премиума";
  }

  return null;
};
