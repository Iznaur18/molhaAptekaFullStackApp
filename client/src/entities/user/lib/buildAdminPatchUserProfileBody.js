import { normalizeRuPhoneInput } from "./ruPhone.js";
import { buildPatchUserProfileBody } from "./buildPatchUserProfileBody.js";
import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
  USER_ROLE_USER,
} from "../model/userConstants.js";

const ALLOWED_ROLES = [USER_ROLE_USER, USER_ROLE_ADMIN, USER_ROLE_MODERATOR];

/**
 * @param {import('./mapUserToEditProfileForm.js').EditProfileFormState} form
 * @param {{ initialPhoneNumber?: string | null; includePremium?: boolean; initialDeliveryAddress?: import('../../address/model/types.js').RuDeliveryAddressValue }} [options]
 * @returns {Record<string, unknown>}
 */
export function buildAdminPatchUserProfileBody(form, options = {}) {
  const { includePremium = true, initialPhoneNumber = null, initialDeliveryAddress } =
    options;
  const body = buildPatchUserProfileBody(form, {
    backgroundMode: "admin",
    initialPhoneNumber,
    initialDeliveryAddress,
  });

  const phoneRaw = String(form.userPhoneNumber).trim();
  const initialPhone = String(initialPhoneNumber ?? "").trim();
  if (phoneRaw !== "") {
    body.userPhoneNumber = normalizeRuPhoneInput(phoneRaw);
  } else if (initialPhone !== "") {
    body.userPhoneNumber = null;
  }

  const role = form.userRole;
  if (ALLOWED_ROLES.includes(role)) {
    body.userRole = role;
  }

  const discount = Number(String(form.userDiscountPercent).trim());
  body.userDiscountPercent = Number.isFinite(discount) ? discount : 0;

  if (includePremium) {
    const premiumExpiresAtRaw = String(form.premiumExpiresAt ?? "").trim();
    body.premiumExpiresAt =
      premiumExpiresAtRaw === "" ? null : new Date(premiumExpiresAtRaw).toISOString();
  }
  body.isActiveUser = Boolean(form.isActiveUser);
  body.isUserDataConfirmed = Boolean(form.isUserDataConfirmed);
  body.isBlockedUser = Boolean(form.isBlockedUser);

  const loyaltyPoints = Math.floor(Number(String(form.userLoyaltyPoints).trim()));
  body.userLoyaltyPoints =
    Number.isFinite(loyaltyPoints) && loyaltyPoints >= 0 ? loyaltyPoints : 0;

  return body;
}
