export const USER_ROLE_USER = "user";
export const USER_ROLE_ADMIN = "admin";
export const USER_ROLE_MODERATOR = "moderator";

export type UserRole = typeof USER_ROLE_USER | typeof USER_ROLE_ADMIN | typeof USER_ROLE_MODERATOR;

export const resolveUserRole = (raw: unknown): UserRole => {
  if (raw === USER_ROLE_ADMIN || raw === USER_ROLE_MODERATOR) {
    return raw;
  }
  return USER_ROLE_USER;
};

export const isAdminRole = (role: UserRole): boolean => role === USER_ROLE_ADMIN;

export const isModeratorRole = (role: UserRole): boolean =>
  role === USER_ROLE_ADMIN || role === USER_ROLE_MODERATOR;
