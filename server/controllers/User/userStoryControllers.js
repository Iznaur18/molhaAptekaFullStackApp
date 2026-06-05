import {
  USER_STORY_REPORT_ALREADY_MESSAGE,
  USER_STORY_REPORT_STATUS_PENDING,
  USER_STORY_STATUS_ACTIVE,
} from "../../constants/userStoryConstants.js";
import { UserModel, UserStoryModel, UserStoryReportModel } from "../../models/index.js";
import {
  assertPremiumCanCreateStory,
  canPublishUserStory,
  createUserStoryRecord,
  deleteOwnUserStory,
  getActiveStoriesForAuthor,
  getPendingUserStoryReportGroups,
  getUserStoriesFeed,
  isStaffUnlimitedUserStories,
  markUserStoryAuthorViewed,
  normalizeUserStoryMediaType,
  resolvePendingUserStoryReports,
} from "../../utils/userStoryHelpers.js";
import { errorRes, successRes } from "../../utils/index.js";

/**
 * `GET /user/stories/feed`
 */
export const getUserStoriesFeedController = async (req, res) => {
  try {
    const viewerUserId = req.userId ? String(req.userId) : null;
    const { rings } = await getUserStoriesFeed(viewerUserId);

    let canPublish = false;
    if (viewerUserId) {
      const user = await UserModel.findById(viewerUserId)
        .select("isPremiumUser userRole isBlockedUser isActiveUser")
        .lean();
      canPublish = canPublishUserStory(user);
    }

    const showStrip = rings.length > 0 || canPublish;

    return successRes(res, {
      rings,
      canPublish,
      showStrip,
    });
  } catch (error) {
    console.error("getUserStoriesFeedController error:", error);
    return errorRes(res, 500, "Ошибка при получении сторисов");
  }
};

/**
 * `GET /user/stories/author/:userIdClient`
 */
export const getUserStoriesByAuthorController = async (req, res) => {
  try {
    const authorUserId = String(req.params.userIdClient);
    const stories = await getActiveStoriesForAuthor(authorUserId);

    return successRes(res, { stories });
  } catch (error) {
    console.error("getUserStoriesByAuthorController error:", error);
    return errorRes(res, 500, "Ошибка при получении сторисов автора");
  }
};

/**
 * `POST /user/stories`
 */
export const createUserStoryController = async (req, res) => {
  try {
    const authorUserId = String(req.userId);
    const user = await UserModel.findById(authorUserId)
      .select("isPremiumUser userRole isBlockedUser isActiveUser")
      .lean();

    if (!canPublishUserStory(user)) {
      return errorRes(
        res,
        403,
        "Публиковать сторис могут только премиум-пользователи и staff",
      );
    }

    if (!isStaffUnlimitedUserStories(user)) {
      try {
        await assertPremiumCanCreateStory(authorUserId);
      } catch (limitError) {
        if (
          limitError instanceof Error &&
          limitError.message === "ACTIVE_STORY_EXISTS"
        ) {
          return errorRes(
            res,
            409,
            "У вас уже есть активный сторис. Дождитесь истечения или удалите его",
          );
        }
        throw limitError;
      }
    }

    const mediaType = normalizeUserStoryMediaType(req.body?.mediaType);
    const mediaUrl = String(req.body?.mediaUrl ?? "").trim();
    const captionText = String(req.body?.captionText ?? "").trim();

    try {
      const story = await createUserStoryRecord({
        authorUserId,
        mediaType,
        mediaUrl,
        captionText,
      });

      return successRes(res, {
        message: "Сторис опубликован",
        story,
      });
    } catch (createError) {
      if (createError instanceof Error && createError.message === "INVALID_MEDIA_URL") {
        return errorRes(res, 400, "Укажите корректный URL загруженного файла");
      }
      throw createError;
    }
  } catch (error) {
    console.error("createUserStoryController error:", error);
    return errorRes(res, 500, "Ошибка при публикации сториса");
  }
};

/**
 * `DELETE /user/stories/:storyId`
 */
export const deleteUserStoryController = async (req, res) => {
  try {
    const userId = String(req.userId);
    const { storyId } = req.params;

    try {
      await deleteOwnUserStory(storyId, userId);
      return successRes(res, { message: "Сторис удалён" });
    } catch (deleteError) {
      if (deleteError instanceof Error) {
        if (deleteError.message === "STORY_NOT_FOUND") {
          return errorRes(res, 404, "Сторис не найден");
        }
        if (deleteError.message === "FORBIDDEN") {
          return errorRes(res, 403, "Можно удалять только свои сторисы");
        }
        if (deleteError.message === "STORY_NOT_ACTIVE") {
          return errorRes(res, 409, "Сторис уже недоступен");
        }
      }
      throw deleteError;
    }
  } catch (error) {
    console.error("deleteUserStoryController error:", error);
    return errorRes(res, 500, "Ошибка при удалении сториса");
  }
};

/**
 * `POST /user/stories/:storyId/view`
 */
export const markUserStoryViewedController = async (req, res) => {
  try {
    const viewerUserId = String(req.userId);
    const { storyId } = req.params;

    const story = await UserStoryModel.findById(storyId)
      .select("authorUserId status expiresAt publishedAt")
      .lean();

    if (
      !story ||
      story.status !== USER_STORY_STATUS_ACTIVE ||
      new Date(story.expiresAt) <= new Date()
    ) {
      return errorRes(res, 404, "Сторис не найден");
    }

    await markUserStoryAuthorViewed(
      viewerUserId,
      String(story.authorUserId),
      story.publishedAt,
    );

    return successRes(res, { message: "Просмотр сохранён" });
  } catch (error) {
    console.error("markUserStoryViewedController error:", error);
    return errorRes(res, 500, "Ошибка при сохранении просмотра");
  }
};

/**
 * `POST /user/stories/:storyId/report`
 */
export const submitUserStoryReportController = async (req, res) => {
  try {
    const reporterId = String(req.userId);
    const { storyId } = req.params;
    const reportText = String(req.body?.reportText ?? "").trim();

    const story = await UserStoryModel.findById(storyId)
      .select("authorUserId status expiresAt")
      .lean();

    if (
      !story ||
      story.status !== USER_STORY_STATUS_ACTIVE ||
      new Date(story.expiresAt) <= new Date()
    ) {
      return errorRes(res, 404, "Сторис не найден");
    }

    if (String(story.authorUserId) === reporterId) {
      return errorRes(res, 400, "Нельзя пожаловаться на свой сторис");
    }

    const existingPending = await UserStoryReportModel.findOne({
      storyId,
      reporterUserId: reporterId,
      status: USER_STORY_REPORT_STATUS_PENDING,
    }).lean();

    if (existingPending) {
      return errorRes(res, 409, USER_STORY_REPORT_ALREADY_MESSAGE);
    }

    await UserStoryReportModel.create({
      storyId,
      reporterUserId: reporterId,
      reportText,
    });

    return successRes(res, { message: "Жалоба принята" });
  } catch (error) {
    if (error?.code === 11000) {
      return errorRes(res, 409, USER_STORY_REPORT_ALREADY_MESSAGE);
    }
    console.error("submitUserStoryReportController error:", error);
    return errorRes(res, 500, "Ошибка при отправке жалобы");
  }
};

/** `GET /user/stories/reports/pending` */
export const getPendingUserStoryReportsController = async (req, res) => {
  try {
    const { groups, totalReports } = await getPendingUserStoryReportGroups();

    return successRes(res, {
      groups,
      totalReports,
      totalGroups: groups.length,
    });
  } catch (error) {
    console.error("getPendingUserStoryReportsController error:", error);
    return errorRes(res, 500, "Ошибка при получении жалоб на сторисы");
  }
};

/** `GET /user/stories/reports/pending/count` */
export const getPendingUserStoryReportsCountController = async (req, res) => {
  try {
    const totalReports = await UserStoryReportModel.countDocuments({
      status: USER_STORY_REPORT_STATUS_PENDING,
    });

    return successRes(res, { totalReports });
  } catch (error) {
    console.error("getPendingUserStoryReportsCountController error:", error);
    return errorRes(res, 500, "Ошибка при получении счётчика жалоб");
  }
};

/** `PATCH /user/stories/reports/story/:storyId/resolve` */
export const resolveUserStoryReportsController = async (req, res) => {
  try {
    const staffUserId = req.userId;
    const { storyId } = req.params;
    const resolution = String(req.body?.resolution ?? "").trim();
    const staffNote = String(req.body?.staffNote ?? "").trim();

    try {
      const result = await resolvePendingUserStoryReports(
        storyId,
        staffUserId,
        staffNote,
        resolution,
      );

      return successRes(res, {
        message: "Жалобы по сторису обработаны",
        resolvedCount: result.resolvedCount,
      });
    } catch (resolveError) {
      if (resolveError instanceof Error) {
        if (resolveError.message === "STORY_NOT_FOUND") {
          return errorRes(res, 404, "Сторис не найден");
        }
        if (resolveError.message === "NO_PENDING_REPORTS") {
          return errorRes(res, 409, "Нет необработанных жалоб по этому сторису");
        }
        if (resolveError.message === "INVALID_RESOLUTION") {
          return errorRes(res, 400, "Недопустимое действие");
        }
      }
      throw resolveError;
    }
  } catch (error) {
    console.error("resolveUserStoryReportsController error:", error);
    return errorRes(res, 500, "Ошибка при обработке жалоб");
  }
};
