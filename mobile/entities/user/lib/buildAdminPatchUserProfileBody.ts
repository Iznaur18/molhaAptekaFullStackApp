import type { AdminEditProfileFormState } from "./mapUserToAdminEditProfileForm";
import { buildPatchUserProfileBody } from "./buildPatchUserProfileBody";

type BuildAdminPatchUserProfileBodyOptions = {
  includePremium: boolean;
  includeRole: boolean;
};

export const buildAdminPatchUserProfileBody = (
  form: AdminEditProfileFormState,
  baseline: AdminEditProfileFormState,
  options: BuildAdminPatchUserProfileBodyOptions,
): Record<string, unknown> => {
  const body = buildPatchUserProfileBody(form, baseline);

  const notes = form.notesAboutUser.trim();
  const baselineNotes = baseline.notesAboutUser.trim();
  if (notes !== baselineNotes) {
    body.notesAboutUser = notes;
  }

  const loyaltyPoints = Math.floor(Number(form.userLoyaltyPoints.trim()));
  const baselineLoyalty = Math.floor(Number(baseline.userLoyaltyPoints.trim()));
  const nextLoyalty =
    Number.isFinite(loyaltyPoints) && loyaltyPoints >= 0 ? loyaltyPoints : 0;
  if (nextLoyalty !== baselineLoyalty) {
    body.userLoyaltyPoints = nextLoyalty;
  }

  if (form.isActiveUser !== baseline.isActiveUser) {
    body.isActiveUser = form.isActiveUser;
  }
  if (form.isUserDataConfirmed !== baseline.isUserDataConfirmed) {
    body.isUserDataConfirmed = form.isUserDataConfirmed;
  }
  if (form.isBlockedUser !== baseline.isBlockedUser) {
    body.isBlockedUser = form.isBlockedUser;
  }

  if (options.includeRole) {
    if (form.userRole !== baseline.userRole) {
      body.userRole = form.userRole;
    }
    const discount = Number(form.userDiscountPercent.trim());
    const baselineDiscount = Number(baseline.userDiscountPercent.trim());
    const nextDiscount = Number.isFinite(discount) ? discount : 0;
    if (nextDiscount !== baselineDiscount) {
      body.userDiscountPercent = nextDiscount;
    }
  }

  if (options.includePremium) {
    const premiumRaw = form.premiumExpiresAt.trim();
    const baselinePremium = baseline.premiumExpiresAt.trim();
    if (premiumRaw !== baselinePremium) {
      body.premiumExpiresAt =
        premiumRaw === "" ? null : new Date(premiumRaw).toISOString();
    }
  }

  return body;
};
