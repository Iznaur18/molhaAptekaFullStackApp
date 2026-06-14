import { isDisplayableMediaUrl, resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";

export const pickUserProfilePhotoUrl = (user: unknown): string | null => {
  if (!user || typeof user !== "object") {
    return null;
  }

  const avatarUrl = String((user as { userAvatarUrl?: string }).userAvatarUrl ?? "").trim();
  if (!avatarUrl || !isDisplayableMediaUrl(avatarUrl)) {
    return null;
  }

  return resolveUploadedMediaUrl(avatarUrl) || null;
};
