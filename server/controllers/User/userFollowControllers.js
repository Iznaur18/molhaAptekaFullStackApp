import {
  USER_FOLLOW_CANNOT_FOLLOW_SELF_MESSAGE,
  USER_FOLLOW_TARGET_BLOCKED_MESSAGE,
  USER_FOLLOW_TARGET_NOT_FOUND_MESSAGE,
} from "../../constants/userFollowConstants.js";
import {
  followUser,
  listUserFollowRelations,
  unfollowUser,
} from "../../services/user/userFollowHelpers.js";
import { errorRes, successRes } from "../../services/http/index.js";

/**
 * `POST /user/:userIdClient/follow`
 */
export const followUserController = async (req, res) => {
  const followerId = String(req.userId);
  const followingId = String(req.params.userIdClient);

  const result = await followUser(followerId, followingId);
  if (!result.ok) {
    if (result.message === "SELF") {
      return errorRes(res, 400, USER_FOLLOW_CANNOT_FOLLOW_SELF_MESSAGE);
    }
    if (result.message === "BLOCKED") {
      return errorRes(res, 403, USER_FOLLOW_TARGET_BLOCKED_MESSAGE);
    }
    return errorRes(res, 404, USER_FOLLOW_TARGET_NOT_FOUND_MESSAGE);
  }

  return successRes(res, {
    message: "Подписка оформлена",
    isFollowing: true,
    followersCount: result.followersCount,
    followingCount: result.followingCount,
  });
};

/**
 * `DELETE /user/:userIdClient/follow`
 */
export const unfollowUserController = async (req, res) => {
  const followerId = String(req.userId);
  const followingId = String(req.params.userIdClient);

  const result = await unfollowUser(followerId, followingId);

  return successRes(res, {
    message: "Подписка отменена",
    isFollowing: false,
    followersCount: result.followersCount,
    followingCount: result.followingCount,
  });
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
