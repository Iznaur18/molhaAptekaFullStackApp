import { ADMIN_ROLE, isStaffRole } from "../access/adminUserGuard.js";

/**
 * Поля только для self/admin.
 * Баллы лояльности — публичны в карточке профиля.
 * Телефон чужим не отдаём в GET — только `hasPhoneNumber` + `GET .../phone` (rate limit).
 * Search по-прежнему режет телефон отдельно.
 */
const USER_PRIVATE_PROFILE_FIELDS = [
  "email",
  "userAddress",
  "userAddressFlat",
  "userAddressDistrict",
  "userAddressStreet",
  "userAddressHouse",
  "userAddressFiasId",
  "userAddressGeo",
  "buyList",
  "userBirthDate",
  "userGender",
  "notificationsEnabled",
  "isEmailVerified",
  "userLastLoginAt",
];

/**
 * @param {Record<string, unknown>} user
 */
function stripPrivateProfileFields(user) {
  const out = { ...user };
  for (const field of USER_PRIVATE_PROFILE_FIELDS) {
    delete out[field];
  }
  return out;
}

/**
 * @param {Record<string, unknown>} user
 */
function stripPhoneNumber(user) {
  const out = { ...user };
  delete out.userPhoneNumber;
  return out;
}

/**
 * @param {{ userRole?: string; isBlockedUser?: boolean } | null | undefined} viewer
 */
export function isPrivilegedAdminViewer(viewer) {
  return Boolean(viewer && viewer.userRole === ADMIN_ROLE && !viewer.isBlockedUser);
}

/** Админы видны в каталоге пользователей наравне с user. */
export function shouldHideAdminProfile() {
  return false;
}

/**
 * @param {Record<string, unknown>} user
 * @param {{ viewer?: { userRole?: string; isBlockedUser?: boolean; _id?: string } | null; viewerId?: string | null }} ctx
 * @returns {Record<string, unknown> | null} null → ответ 404
 */
export function sanitizeUserProfileForViewer(user, ctx) {
  if (shouldHideAdminProfile()) {
    return null;
  }

  const privileged = isPrivilegedAdminViewer(ctx.viewer);
  const viewerId = ctx.viewerId ? String(ctx.viewerId) : "";
  const isSelf = viewerId && viewerId === String(user._id ?? "");

  const stripOneCSecrets = (raw) => {
    if (!raw?.oneCIntegration || typeof raw.oneCIntegration !== "object") {
      return raw;
    }
    const integration = { ...raw.oneCIntegration };
    delete integration.apiKeySealed;
    return { ...raw, oneCIntegration: integration };
  };

  if (privileged || isSelf) {
    return stripOneCSecrets({ ...user });
  }

  const hasPhoneNumber = Boolean(String(user.userPhoneNumber ?? "").trim());
  const out = stripPhoneNumber(stripPrivateProfileFields(user));
  delete out.userRole;
  delete out.isActiveUser;
  delete out.isBlockedUser;
  delete out.oneCIntegration;
  delete out.userDiscountPercent;
  delete out.notesAboutUser;
  if (hasPhoneNumber) {
    out.hasPhoneNumber = true;
  }

  return out;
}

/**
 * @param {Record<string, unknown>} query
 * @param {{ viewer?: { userRole?: string; isBlockedUser?: boolean } | null; roleFilter?: string }} ctx
 */
export function applyAdminVisibilityToUsersSearchQuery(usersQuery, ctx) {
  const { roleFilter, viewer } = ctx;

  if (!roleFilter) {
    return;
  }

  const canFilterByRole =
    Boolean(viewer) && isStaffRole(viewer.userRole) && !viewer.isBlockedUser;

  if (!canFilterByRole) {
    return;
  }

  usersQuery.userRole = roleFilter;
}

/**
 * @param {Record<string, unknown>[]} users
 * @param {{ viewer?: { userRole?: string; isBlockedUser?: boolean } | null }} ctx
 */
export function sanitizeUsersSearchList(users, ctx) {
  if (isPrivilegedAdminViewer(ctx.viewer)) {
    return users;
  }

  return users.map((row) => {
    const item = stripPhoneNumber(stripPrivateProfileFields(row));
    delete item.userRole;
    delete item.isActiveUser;
    delete item.isBlockedUser;
    return item;
  });
}
