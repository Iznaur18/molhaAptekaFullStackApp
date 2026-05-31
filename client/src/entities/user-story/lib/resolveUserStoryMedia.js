import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { pickUserProfilePhotoUrl } from "../../user/lib/pickUserProfilePhotoUrl.js";

/**
 * @param {import('../model/types.js').UserStoryRingFromApi['author']} author
 */
export function resolveUserStoryAvatarUrl(author) {
  return pickUserProfilePhotoUrl(author);
}

/**
 * @param {string | null | undefined} mediaUrl
 */
export function resolveUserStoryMediaUrl(mediaUrl) {
  if (!mediaUrl) {
    return "";
  }
  return resolveImageUrlForDisplay(mediaUrl);
}
