import {
  isAdminRole,
  isModeratorRole,
  resolveUserRole,
  type UserRole,
} from "@izibuy/shared-lib";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";

export type UserAccess = {
  isAuthorized: boolean;
  isGuest: boolean;
  role: UserRole;
  isAdmin: boolean;
  canModerate: boolean;
  canModerateProducts: boolean;
  isUserDataConfirmed: boolean;
  isPremiumUser: boolean;
};

export const useUserAccess = (): UserAccess => {
  const sessionQuery = useAuthSessionQuery();
  const user = sessionQuery.data?.user;
  const isAuthorized = Boolean(user) && !sessionQuery.isPending;
  const role = resolveUserRole(user?.userRole);

  return {
    isAuthorized,
    isGuest: !isAuthorized,
    role,
    isAdmin: isAdminRole(role),
    canModerate: isModeratorRole(role),
    canModerateProducts: isAdminRole(role) || isModeratorRole(role),
    isUserDataConfirmed: user?.isUserDataConfirmed === true,
    isPremiumUser: user?.isPremiumUser === true,
  };
};
