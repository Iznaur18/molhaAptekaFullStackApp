import { successRes } from "../../services/http/index.js";
import {
  castUserVote,
  getMyVoteForTarget,
  getUserVoteRating,
  listReceivedUserVotes,
} from "../../services/user/userVoteRating.js";

/** Оценка текущего пользователя целевому. GET /vote/me/:userVoteTargetIdClient */
export const getMyVoteForTargetController = async (req, res) => {
  const data = await getMyVoteForTarget({
    voterUserId: String(req.userId),
    targetUserId: String(req.params.userVoteTargetIdClient),
  });
  return successRes(res, data);
};

/** Голосование за пользователя. POST /vote/:userVoteTargetIdClient */
export const userVoteRatingController = async (req, res) => {
  const data = await castUserVote({
    voterUserId: String(req.userId),
    targetUserId: String(req.params.userVoteTargetIdClient),
    userVoteValueClient: req.body.userVoteValueClient,
  });
  return successRes(res, data);
};

/** Список голосов, полученных текущим пользователем. GET /vote/me/received */
export const listMyReceivedVotesController = async (req, res) => {
  const data = await listReceivedUserVotes({
    targetUserId: String(req.userId),
    page: req.query.page,
    limit: req.query.limit,
  });
  return successRes(res, data);
};

/** Получение рейтинга пользователя. GET /vote/rating/:userId */
export const userGetRatingController = async (req, res) => {
  const data = await getUserVoteRating({
    userId: String(req.params.userIdClient),
  });
  return successRes(res, data);
};
