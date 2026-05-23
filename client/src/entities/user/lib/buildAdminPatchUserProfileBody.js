import { buildPatchUserProfileBody } from "./buildPatchUserProfileBody.js";
import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
  USER_ROLE_USER,
} from "../model/userConstants.js";

const ALLOWED_ROLES = [USER_ROLE_USER, USER_ROLE_ADMIN, USER_ROLE_MODERATOR];

/**
 * @param {import('./mapUserToEditProfileForm.js').EditProfileFormState} form
 * @returns {Record<string, unknown>}
 */
export function buildAdminPatchUserProfileBody(form) {
  const body = buildPatchUserProfileBody(form, { backgroundMode: "admin" });

  const role = form.userRole;
  if (ALLOWED_ROLES.includes(role)) {
    body.userRole = role;
  }

  const discount = Number(String(form.userDiscountPercent).trim());
  body.userDiscountPercent = Number.isFinite(discount) ? discount : 0;

  body.isPremiumUser = Boolean(form.isPremiumUser);
  body.isActiveUser = Boolean(form.isActiveUser);
  body.isUserDataConfirmed = Boolean(form.isUserDataConfirmed);
  body.isBlockedUser = Boolean(form.isBlockedUser);

  return body;
}
