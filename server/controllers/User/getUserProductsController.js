import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { getOptionalViewerFromRequest } from "../../services/user/optionalViewerFromRequest.js";
import { sanitizeUserProfileForViewer } from "../../services/user/userProfileVisibility.js";
import {
  getSellerCatalogProductsPage,
  USER_SELLER_PRODUCTS_PAGE_SIZE_DEFAULT,
  USER_SELLER_PRODUCTS_PAGE_SIZE_MAX,
} from "../../services/user/userSellerCatalogProducts.js";

const parsePageLimit = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(
    USER_SELLER_PRODUCTS_PAGE_SIZE_MAX,
    Math.max(1, Number(query.limit) || USER_SELLER_PRODUCTS_PAGE_SIZE_DEFAULT),
  );
  return { page, limit };
};

/** `GET /user/:userIdClient/products` — товары продавца в каталоге (публично, JWT опционален). */
export const getUserProductsController = async (req, res) => {
  const targetUserId = req.params.userIdClient;
  const targetUser = await UserModel.findById(targetUserId).lean();

  if (!targetUser) {
    return errorRes(res, 404, "Пользователь не найден");
  }

  const viewer = await getOptionalViewerFromRequest(req);
  const publicUser = sanitizeUserProfileForViewer(targetUser, {
    viewer,
    viewerId: req.userId ?? null,
  });

  if (!publicUser) {
    return errorRes(res, 404, "Пользователь не найден");
  }

  const { page, limit } = parsePageLimit(req.query);
  const shelfId =
    req.query.shelfId != null ? String(req.query.shelfId).trim() : "";
  const payload = await getSellerCatalogProductsPage(targetUserId, page, limit, {
    shelfId: shelfId || null,
    viewerUserId: req.userId ?? null,
  });

  return successRes(res, payload);
};
