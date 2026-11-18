import { successRes } from "../../services/http/index.js";
import {
  blockUser,
  listUsersBlockedBy,
  unblockUserForViewer,
} from "../../services/user/userBlockHelpers.js";

/**
 * `POST /user/:userIdClient/block`
 */
export const blockUserController = async (req, res) => {
  const data = await blockUser(String(req.userId), String(req.params.userIdClient));
  return successRes(res, data);
};

/**
 * `DELETE /user/:userIdClient/block`
 */
export const unblockUserController = async (req, res) => {
  const data = await unblockUserForViewer({
    viewerId: String(req.userId),
    blockedId: String(req.params.userIdClient),
    asUserId: req.query.asUserId,
  });
  return successRes(res, data);
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
