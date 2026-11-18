import { successRes } from "../../services/http/index.js";
import {
  followUser,
  listUserFollowRelations,
  unfollowUser,
} from "../../services/user/userFollowHelpers.js";

/**
 * `POST /user/:userIdClient/follow`
 */
export const followUserController = async (req, res) => {
  const data = await followUser(
    String(req.userId),
    String(req.params.userIdClient),
  );
  return successRes(res, data);
};

/**
 * `DELETE /user/:userIdClient/follow`
 */
export const unfollowUserController = async (req, res) => {
  const data = await unfollowUser(
    String(req.userId),
    String(req.params.userIdClient),
  );
  return successRes(res, data);
};

/**
 * `GET /user/me/following`
 */
export const listMyFollowingController = async (req, res) => {
  const data = await listUserFollowRelations({
    userId: String(req.userId),
    role: "following",
    page: req.query.page,
    limit: req.query.limit,
  });
  return successRes(res, data);
};

/**
 * `GET /user/me/followers`
 */
export const listMyFollowersController = async (req, res) => {
  const data = await listUserFollowRelations({
    userId: String(req.userId),
    role: "followers",
    page: req.query.page,
    limit: req.query.limit,
  });
  return successRes(res, data);
};
