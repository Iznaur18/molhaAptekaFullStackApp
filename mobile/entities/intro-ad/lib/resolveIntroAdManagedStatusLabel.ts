import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";

export const resolveIntroAdManagedStatusLabel = (status: string | null | undefined) => {
  if (status === "active") {
    return INTRO_AD_MODERATION_PAGE_UI.STATUS_ACTIVE;
  }
  if (status === "queued") {
    return INTRO_AD_MODERATION_PAGE_UI.STATUS_QUEUED;
  }
  return status ?? "—";
};
