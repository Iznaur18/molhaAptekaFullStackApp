import {
  USER_FOLLOW_CANNOT_FOLLOW_SELF_MESSAGE,
  USER_FOLLOW_TARGET_BLOCKED_MESSAGE,
  USER_FOLLOW_TARGET_NOT_FOUND_MESSAGE,
} from "../../constants/userFollowConstants.js";
import {
  attachFollowFieldsToPublicProfile,
  followUser,
  listUserFollowRelations,
  unfollowUser,
} from "../../utils/userFollowHelpers.js";
import { errorRes, successRes } from "../../utils/index.js";

/**
 * `POST /user/:userIdClient/follow`
 */
export const followUserController = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("followUserController error:", error);
    return errorRes(res, 500, "Ошибка при подписке");
  }
};

/**
 * `DELETE /user/:userIdClient/follow`
 */
export const unfollowUserController = async (req, res) => {
  try {
    const followerId = String(req.userId);
    const followingId = String(req.params.userIdClient);

    const result = await unfollowUser(followerId, followingId);

    return successRes(res, {
      message: "Подписка отменена",
      isFollowing: false,
      followersCount: result.followersCount,
      followingCount: result.followingCount,
    });
  } catch (error) {
    console.error("unfollowUserController error:", error);
    return errorRes(res, 500, "Ошибка при отписке");
  }
};

/**
 * `GET /user/me/following`
 */
export const listMyFollowingController = async (req, res) => {
  try {
    const data = await listUserFollowRelations({
      userId: String(req.userId),
      role: "following",
      page: req.query.page,
      limit: req.query.limit,
    });

    return successRes(res, data);
  } catch (error) {
    console.error("listMyFollowingController error:", error);
    return errorRes(res, 500, "Ошибка при загрузке подписок");
  }
};

/**
 * `GET /user/me/followers`
 */
export const listMyFollowersController = async (req, res) => {
  try {
    const data = await listUserFollowRelations({
      userId: String(req.userId),
      role: "followers",
      page: req.query.page,
      limit: req.query.limit,
    });

    return successRes(res, data);
  } catch (error) {
    console.error("listMyFollowersController error:", error);
    return errorRes(res, 500, "Ошибка при загрузке подписчиков");
  }
};
