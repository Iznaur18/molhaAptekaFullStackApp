import { USER_DATA } from "../../constants/constants.js";
import { UserModel } from "../../models/index.js";
import { sanitizeUserProfileForViewer } from "../user/userProfileVisibility.js";
import { resolveFrontendOrigin } from "../../utils/resolveFrontendOrigin.js";
import {
  appendMediaCacheBust,
  resolveAbsolutePublicMediaUrl,
  resolveSiteOgImageUrl,
} from "./resolveAbsolutePublicMediaUrl.js";

/**
 * Фон → аватар → общий og-image (preset-фон пропускаем).
 *
 * @param {string} sellerId
 * @returns {Promise<{
 *   title: string;
 *   description: string;
 *   url: string;
 *   imageUrl: string;
 * } | null>}
 */
export async function getSellerLinkPreview(sellerId) {
  const user = await UserModel.findById(sellerId).select(USER_DATA).lean();
  if (!user) {
    return null;
  }

  if (user.isBlockedUser || user.isActiveUser === false) {
    return null;
  }

  const publicUser = sanitizeUserProfileForViewer(user, {
    viewer: null,
    viewerId: null,
  });
  if (!publicUser) {
    return null;
  }

  const origin = resolveFrontendOrigin(process.env.FRONTEND_URL);
  const url = `${origin}/seller/${encodeURIComponent(String(user._id))}`;
  const name = String(user.userName ?? "").trim() || "Продавец";
  const title = `${name} — витрина на Gitorg`;
  const description = `Товары продавца ${name} на Gitorg`;

  const backgroundAbs = resolveAbsolutePublicMediaUrl(user.userBackgroundUrl, {
    pageOrigin: origin,
  });
  const avatarAbs = resolveAbsolutePublicMediaUrl(user.userAvatarUrl, {
    pageOrigin: origin,
  });
  const absoluteImage = backgroundAbs || avatarAbs || resolveSiteOgImageUrl();
  const imageUrl = appendMediaCacheBust(
    absoluteImage,
    user.updatedAt ?? user.createdAt ?? null,
  );

  return { title, description, url, imageUrl };
}
