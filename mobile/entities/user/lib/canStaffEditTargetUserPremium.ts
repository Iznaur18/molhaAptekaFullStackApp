import {
  USER_ROLE_ADMIN,
  USER_ROLE_MODERATOR,
  type UserRole,
} from "@izibuy/shared-lib";

type CanStaffEditTargetUserPremiumParams = {
  editorRole: UserRole;
  targetRole?: string | null;
};

export const canStaffEditTargetUserPremium = ({
  editorRole,
  targetRole,
}: CanStaffEditTargetUserPremiumParams): boolean => {
  if (editorRole === USER_ROLE_ADMIN) {
    return true;
  }
  if (editorRole !== USER_ROLE_MODERATOR) {
    return false;
  }
  return targetRole !== USER_ROLE_ADMIN;
};
