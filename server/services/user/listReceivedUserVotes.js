import {
  USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT,
  USER_VOTE_RECEIVED_MAX_LIST_LIMIT,
} from "@molha/api-contract";

import { UserModel, UserVoteRatingModel } from "../../models/index.js";

const VOTER_LIST_SELECT =
  "userName userAvatarUrl userAvatarFocus isPremiumUser isUserDataConfirmed";

/**
 * Голоса, полученные текущим пользователем (сортировка: оценка ↓).
 *
 * @param {{
 *   targetUserId: string;
 *   page?: number;
 *   limit?: number;
 * }} params
 */
export async function listReceivedUserVotes({
  targetUserId,
  page = 1,
  limit = USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    USER_VOTE_RECEIVED_MAX_LIST_LIMIT,
    Math.max(1, Number(limit) || USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT),
  );
  const skip = (safePage - 1) * safeLimit;

  const filter = { userVoteTarget: targetUserId };

  const [rows, total, targetUser] = await Promise.all([
    UserVoteRatingModel.find(filter)
      .sort({ userVoteValue: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("userVoter", VOTER_LIST_SELECT)
      .lean(),
    UserVoteRatingModel.countDocuments(filter),
    UserModel.findById(targetUserId).select("userRatingByVotes").lean(),
  ]);

  const rating = targetUser?.userRatingByVotes ?? {};
  const countVotes = Math.max(0, Math.floor(Number(rating.countVotes)) || 0);
  const totalRating = Math.max(0, Number(rating.totalRating) || 0);
  const averageRating =
    countVotes > 0 ? Math.round((totalRating / countVotes) * 10) / 10 : 0;

  const votes = rows.map((row) => {
    const voter = row.userVoter;
    return {
      voteId: String(row._id),
      userVoteValue: Number(row.userVoteValue) || 0,
      voter: voter
        ? {
            _id: String(voter._id),
            userName: voter.userName ?? "",
            userAvatarUrl: voter.userAvatarUrl ?? "",
            userAvatarFocus: voter.userAvatarFocus ?? null,
            isPremiumUser: Boolean(voter.isPremiumUser),
            isUserDataConfirmed: voter.isUserDataConfirmed === true,
          }
        : null,
    };
  });

  return {
    votes,
    summary: {
      countVotes,
      totalRating,
      averageRating,
    },
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 0,
    },
  };
}
