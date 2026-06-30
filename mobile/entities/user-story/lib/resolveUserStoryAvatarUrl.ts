import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";

import type { UserStoryRing } from "../api/userStoryApi";

export const resolveUserStoryAvatarUrl = (
  author: UserStoryRing["author"],
): string | null => pickUserProfilePhotoUrl(author);
