import mongoose from "mongoose";

import { USER_ME_RAITING } from "../../constants/constants.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel, UserVoteRatingModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { listReceivedUserVotes } from "./listReceivedUserVotes.js";

const VOTE_RESPONSE_USER_FIELDS = "_id userRatingByVotes userName email userAvatarUrl";

/** @param {unknown} id */
function toObjectId(id) {
  return new mongoose.Types.ObjectId(String(id));
}

/**
 * @param {{ voterUserId: string; targetUserId: string }} args
 */
export async function getMyVoteForTarget({ voterUserId, targetUserId }) {
  const voterOid = toObjectId(voterUserId);
  const targetOid = toObjectId(targetUserId);

  if (String(voterOid) === String(targetOid)) {
    return { myVoteValue: null };
  }

  const row = await UserVoteRatingModel.findOne({
    userVoter: voterOid,
    userVoteTarget: targetOid,
  })
    .select("userVoteValue")
    .lean();

  return {
    myVoteValue: row?.userVoteValue ?? null,
  };
}

/**
 * @param {{
 *   voterUserId: string;
 *   targetUserId: string;
 *   userVoteValueClient: unknown;
 * }} args
 */
export async function castUserVote({
  voterUserId,
  targetUserId,
  userVoteValueClient,
}) {
  const targetOid = toObjectId(targetUserId);
  const voterOid = toObjectId(voterUserId);
  const userVoteValue = Math.round(Number(userVoteValueClient));

  if (String(voterOid) === String(targetOid)) {
    throw new AppError(400, "Нельзя голосовать за самого себя");
  }

  const userVoteTarget = await UserModel.findById(targetOid).select("userRole");
  if (!userVoteTarget) {
    throw new AppError(404, "Целевой пользователь не найден");
  }

  const existingVote = await UserVoteRatingModel.findOne({
    userVoter: voterOid,
    userVoteTarget: targetOid,
  }).lean();

  if (existingVote) {
    const delta = userVoteValue - existingVote.userVoteValue;

    if (delta !== 0) {
      try {
        await UserModel.findByIdAndUpdate(targetOid, {
          $inc: { "userRatingByVotes.totalRating": delta },
        });
        await UserVoteRatingModel.findByIdAndUpdate(existingVote._id, {
          userVoteValue,
        });
      } catch (err) {
        try {
          await UserModel.findByIdAndUpdate(targetOid, {
            $inc: { "userRatingByVotes.totalRating": -delta },
          });
        } catch (rollbackError) {
          logServerEvent("error", {
            event: "uservote_update_rollback_failed",
            targetUserId: String(targetOid),
            error:
              rollbackError instanceof Error
                ? rollbackError.message
                : String(rollbackError),
          });
        }
        throw err;
      }
    }

    const updatedTargetUser = await UserModel.findById(targetOid)
      .select(VOTE_RESPONSE_USER_FIELDS)
      .lean();

    return {
      user: updatedTargetUser,
      message: delta === 0 ? "Оценка без изменений" : "Оценка обновлена",
    };
  }

  const vote = new UserVoteRatingModel({
    userVoter: voterOid,
    userVoteTarget: targetOid,
    userVoteValue,
  });

  await vote.save();

  try {
    const updatedTargetUser = await UserModel.findByIdAndUpdate(
      targetOid,
      {
        $inc: {
          "userRatingByVotes.countVotes": 1,
          "userRatingByVotes.totalRating": userVoteValue,
        },
      },
      { returnDocument: "after" },
    )
      .select(VOTE_RESPONSE_USER_FIELDS)
      .lean();

    return {
      user: updatedTargetUser,
      message: "Голос успешно поставлен",
    };
  } catch (errorAfterSave) {
    try {
      await UserVoteRatingModel.findByIdAndDelete(vote._id);
      await UserModel.findByIdAndUpdate(targetOid, {
        $inc: {
          "userRatingByVotes.countVotes": -1,
          "userRatingByVotes.totalRating": -userVoteValue,
        },
      });
    } catch (rollbackError) {
      logServerEvent("error", {
        event: "uservote_create_rollback_failed",
        targetUserId: String(targetOid),
        voteId: String(vote._id),
        error:
          rollbackError instanceof Error
            ? rollbackError.message
            : String(rollbackError),
      });
    }
    throw errorAfterSave;
  }
}

/**
 * @param {{ userId: string }} args
 */
export async function getUserVoteRating({ userId }) {
  const user = await UserModel.findById(userId).select(USER_ME_RAITING).lean();

  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const { countVotes = 0, totalRating = 0 } = user.userRatingByVotes || {};
  const averageRating = countVotes > 0 ? totalRating / countVotes : 0;

  return {
    user: {
      _id: user._id,
      userName: user.userName,
      userAvatarUrl: user.userAvatarUrl,
      rating: {
        countVotes,
        totalRating,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    },
  };
}

export { listReceivedUserVotes };
