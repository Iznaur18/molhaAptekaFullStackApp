import mongoose from "mongoose";
import { UserVoteRatingModel, UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../utils/index.js";
import { USER_ME_RAITING } from "../../constants/constants.js";
const VOTE_RESPONSE_USER_FIELDS = "_id userRatingByVotes userName email userAvatarUrl";

/** @param {unknown} id */
function toObjectId(id) {
  return new mongoose.Types.ObjectId(String(id));
}

/** Оценка текущего пользователя (JWT) целевому: если уже голосовал — значение 1–10, иначе `null`. GET /vote/me/:userVoteTargetIdClient */
export const getMyVoteForTargetController = async (req, res) => {
  try {
    const voterOid = toObjectId(req.userId);
    const targetOid = toObjectId(req.params.userVoteTargetIdClient);

    if (String(voterOid) === String(targetOid)) {
      return successRes(res, { myVoteValue: null });
    }

    const row = await UserVoteRatingModel.findOne({
      userVoter: voterOid,
      userVoteTarget: targetOid,
    })
      .select("userVoteValue")
      .lean();

    return successRes(res, {
      myVoteValue: row?.userVoteValue ?? null,
    });
  } catch (error) {
    console.error("getMyVoteForTarget error:", error);
    return errorRes(res, 500, error.message || "Ошибка при получении вашей оценки");
  }
};

/** Голосование за пользователя: первый раз или обновление оценки. POST /vote/:userVoteTargetIdClient */
export const userVoteRatingController = async (req, res) => {
  try {
    const targetOid = toObjectId(req.params.userVoteTargetIdClient);
    const voterOid = toObjectId(req.userId);
    const { userVoteValueClient } = req.body;

    const userVoteValue = Math.round(Number(userVoteValueClient));

    if (String(voterOid) === String(targetOid)) {
      return errorRes(res, 400, "Нельзя голосовать за самого себя");
    }

    const userVoteTarget = await UserModel.findById(targetOid).select("userRole");
    if (!userVoteTarget) {
      return errorRes(res, 404, "Целевой пользователь не найден");
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
          await UserModel.findByIdAndUpdate(targetOid, {
            $inc: { "userRatingByVotes.totalRating": -delta },
          }).catch(() => {});
          throw err;
        }
      }

      const updatedTargetUser = await UserModel.findById(targetOid)
        .select(VOTE_RESPONSE_USER_FIELDS)
        .lean();

      const message = delta === 0 ? "Оценка без изменений" : "Оценка обновлена";

      return successRes(res, {
        user: updatedTargetUser,
        message,
      });
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

      return successRes(res, {
        user: updatedTargetUser,
        message: "Голос успешно поставлен",
      });
    } catch (errorAfterSave) {
      await UserVoteRatingModel.findByIdAndDelete(vote._id);
      await UserModel.findByIdAndUpdate(targetOid, {
        $inc: {
          "userRatingByVotes.countVotes": -1,
          "userRatingByVotes.totalRating": -userVoteValue,
        },
      });
      throw errorAfterSave;
    }
  } catch (error) {
    console.error("Vote error:", error);
    const message = error.message || "Ошибка при голосовании за пользователя";
    return errorRes(res, 500, message);
  }
};

/** Получение рейтинга пользователя. GET /vote/rating/:userId */

export const userGetRatingController = async (req, res) => {
  try {
    const { userIdClient } = req.params;

    const userIdServer = await UserModel.findById(userIdClient)
      .select(USER_ME_RAITING)
      .lean();

    if (!userIdServer) {
      return errorRes(res, 404, "Пользователь не найден");
    }

    const { countVotes = 0, totalRating = 0 } = userIdServer.userRatingByVotes || {};
    const averageRating = countVotes > 0 ? totalRating / countVotes : 0;

    return successRes(res, {
      user: {
        _id: userIdServer._id,
        userName: userIdServer.userName,
        userAvatarUrl: userIdServer.userAvatarUrl,
        rating: {
          countVotes,
          totalRating,
          averageRating: Math.round(averageRating * 10) / 10,
        },
      },
    });
  } catch (error) {
    console.error("Get rating error:", error);
    return errorRes(res, 500, error.message || "Ошибка при получении рейтинга");
  }
};
