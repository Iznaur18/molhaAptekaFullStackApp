import { UserModel } from "../../models/index.js";
import { ADMIN_ROLE } from "../access/adminUserGuard.js";

const MODERATION_ACCESS_SELECT = "userRole productModerationTrusted";

/**
 * Товар этого автора попадает в каталог без очереди модерации: либо он админ,
 * либо админ выдал ему персональное доверие.
 *
 * @param {{ userRole?: string; productModerationTrusted?: boolean } | null | undefined} user
 */
export const canSkipProductModeration = (user) =>
  user?.userRole === ADMIN_ROLE || user?.productModerationTrusted === true;

/**
 * Права на запись товара одним запросом: роль нужна для доступа к чужим
 * карточкам, доверие — только для модерации, и смешивать их нельзя.
 *
 * @param {string | null | undefined} userId
 * @returns {Promise<{ isAdmin: boolean; skipsModeration: boolean }>}
 */
export async function loadProductWriteAccess(userId) {
  if (!userId) {
    return { isAdmin: false, skipsModeration: false };
  }

  const user = await UserModel.findById(userId).select(MODERATION_ACCESS_SELECT).lean();

  return {
    isAdmin: user?.userRole === ADMIN_ROLE,
    skipsModeration: canSkipProductModeration(user),
  };
}

/**
 * @param {string | null | undefined} sellerId
 * @returns {Promise<boolean>}
 */
export async function isSellerProductModerationTrusted(sellerId) {
  if (!sellerId) return false;
  const seller = await UserModel.findById(sellerId)
    .select("productModerationTrusted")
    .lean();
  return seller?.productModerationTrusted === true;
}
