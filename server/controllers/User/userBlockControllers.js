import {
  USER_BLOCK_CANNOT_BLOCK_SELF_MESSAGE,
  USER_BLOCK_LIMIT_REACHED_MESSAGE,
  USER_BLOCK_NOT_BLOCKED_MESSAGE,
  USER_BLOCK_TARGET_NOT_FOUND_MESSAGE,
} from "../../constants/userBlockConstants.js";
import {
  blockUser,
  listUsersBlockedBy,
  unblockUser,
} from "../../services/user/userBlockHelpers.js";
import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";

/**
 * `POST /user/:userIdClient/block`
 */
export const blockUserController = async (req, res) => {
  const blockerId = String(req.userId);
  const blockedId = String(req.params.userIdClient);

  const result = await blockUser(blockerId, blockedId);
  if (!result.ok) {
    if (result.message === "SELF") {
      return errorRes(res, 400, USER_BLOCK_CANNOT_BLOCK_SELF_MESSAGE);
    }
    if (result.message === "LIMIT") {
      return errorRes(res, 400, USER_BLOCK_LIMIT_REACHED_MESSAGE);
    }
    return errorRes(res, 404, USER_BLOCK_TARGET_NOT_FOUND_MESSAGE);
  }

  return successRes(res, {
    message: result.alreadyBlocked ? "Пользователь уже заблокирован" : "Пользователь заблокирован",
    isBlockedByMe: true,
    blockedAt: result.blockedAt,
  });
};

/**
 * `DELETE /user/:userIdClient/block`
 */
export const unblockUserController = async (req, res) => {
  const viewerId = String(req.userId);
  const blockedId = String(req.params.userIdClient);
  const viewer = await UserModel.findById(viewerId).select("userRole").lean();
  const isModerator =
    viewer?.userRole === "admin" || viewer?.userRole === "moderator";

  const blockerId =
    isModerator && req.query.asUserId && String(req.query.asUserId).trim()
      ? String(req.query.asUserId).trim()
      : viewerId;

  if (blockerId !== viewerId && !isModerator) {
    return errorRes(res, 403, "Недостаточно прав");
  }

  const result = await unblockUser(blockerId, blockedId);
  if (!result.wasBlocked) {
    return errorRes(res, 404, USER_BLOCK_NOT_BLOCKED_MESSAGE);
  }

  return successRes(res, {
    message: "Пользователь разблокирован",
    isBlockedByMe: false,
  });
};

/**
 * `GET /user/me/blocked-users`
 */
export const listMyBlockedUsersController = async (req, res) => {
  const data = await listUsersBlockedBy({
    blockerId: String(req.userId),
    page: req.query.page,
    limit: req.query.limit,
  });

  return successRes(res, data);
};

/**
 * `GET /user/:userIdClient/blocked-users` — moderator: список блокировок пользователя
 */
export const listUserBlockedUsersModeratorController = async (req, res) => {
  const data = await listUsersBlockedBy({
    blockerId: String(req.params.userIdClient),
    page: req.query.page,
    limit: req.query.limit,
  });

  return successRes(res, data);
};
