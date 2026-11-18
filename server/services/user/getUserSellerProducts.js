import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { resolveOneCGroupBranchIds } from "../seller-shelf/sellerOneCShelves.js";
import { getOptionalViewerFromRequest } from "./optionalViewerFromRequest.js";
import { sanitizeUserProfileForViewer } from "./userProfileVisibility.js";
import {
  getSellerCatalogProductsPage,
  USER_SELLER_PRODUCTS_PAGE_SIZE_DEFAULT,
  USER_SELLER_PRODUCTS_PAGE_SIZE_MAX,
} from "./userSellerCatalogProducts.js";

/**
 * @param {Record<string, unknown>} query
 */
const parsePageLimit = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(
    USER_SELLER_PRODUCTS_PAGE_SIZE_MAX,
    Math.max(1, Number(query.limit) || USER_SELLER_PRODUCTS_PAGE_SIZE_DEFAULT),
  );
  return { page, limit };
};

/**
 * @param {{
 *   targetUserId: string;
 *   viewerUserId?: unknown;
 *   query: Record<string, unknown>;
 *   req: import('express').Request;
 * }} args
 */
export async function getUserSellerProducts({
  targetUserId,
  viewerUserId,
  query,
  req,
}) {
  const targetUser = await UserModel.findById(targetUserId).lean();
  if (!targetUser) {
    throw new AppError(404, "Пользователь не найден");
  }

  const viewer = await getOptionalViewerFromRequest(req);
  const publicUser = sanitizeUserProfileForViewer(targetUser, {
    viewer,
    viewerId: viewerUserId ?? null,
  });
  if (!publicUser) {
    throw new AppError(404, "Пользователь не найден");
  }

  const { page, limit } = parsePageLimit(query);
  const shelfId = query.shelfId != null ? String(query.shelfId).trim() : "";
  const onecGroupId =
    query.onecGroupId != null ? String(query.onecGroupId).trim() : "";
  const onecGroupIds = onecGroupId
    ? await resolveOneCGroupBranchIds(targetUserId, onecGroupId)
    : null;

  return getSellerCatalogProductsPage(targetUserId, page, limit, {
    shelfId: shelfId || null,
    onecGroupIds,
    viewerUserId: viewerUserId ?? null,
  });
}
