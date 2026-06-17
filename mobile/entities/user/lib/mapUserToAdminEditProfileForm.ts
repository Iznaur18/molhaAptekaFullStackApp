import {
  USER_ROLE_USER,
  type UserRole,
} from "@izibuy/shared-lib";

import { formatPremiumExpiresAtForInput } from "./formatPremiumExpiresAtForInput";
import { mapUserToEditProfileForm, type EditProfileFormState } from "./mapUserToEditProfileForm";

export type AdminEditProfileFormState = EditProfileFormState & {
  notesAboutUser: string;
  userRole: UserRole;
  userDiscountPercent: string;
  userLoyaltyPoints: string;
  premiumExpiresAt: string;
  isActiveUser: boolean;
  isUserDataConfirmed: boolean;
  isBlockedUser: boolean;
};

export const mapUserToAdminEditProfileForm = (
  user: Record<string, unknown>,
): AdminEditProfileFormState => ({
  ...mapUserToEditProfileForm(user),
  notesAboutUser: typeof user.notesAboutUser === "string" ? user.notesAboutUser : "",
  userRole:
    user.userRole === "admin" || user.userRole === "moderator"
      ? user.userRole
      : USER_ROLE_USER,
  userDiscountPercent:
    user.userDiscountPercent != null ? String(user.userDiscountPercent) : "0",
  userLoyaltyPoints:
    user.userLoyaltyPoints != null ? String(user.userLoyaltyPoints) : "0",
  premiumExpiresAt: formatPremiumExpiresAtForInput(
    user.premiumExpiresAt as string | Date | null | undefined,
  ),
  isActiveUser: user.isActiveUser !== false,
  isUserDataConfirmed: user.isUserDataConfirmed === true,
  isBlockedUser: user.isBlockedUser === true,
});
