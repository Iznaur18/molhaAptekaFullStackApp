import {
  USER_STORY_REPORT_ALREADY_MESSAGE,
  USER_STORY_REPORT_STATUS_PENDING,
  USER_STORY_STATUS_ACTIVE,
} from "../../constants/userStoryConstants.js";
import { UserModel, UserStoryModel, UserStoryReportModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import {
  assertPremiumCanCreateStory,
  canPublishUserStory,
  createUserStoryRecord,
  deleteOwnUserStory,
  getActiveStoriesForAuthor,
  getPendingUserStoryReportGroups,
  getUserStoriesFeed as fetchUserStoriesFeed,
  isStaffUnlimitedUserStories,
  markUserStoryAuthorViewed,
  normalizeUserStoryMediaType,
  resolvePendingUserStoryReports,
} from "./userStoryHelpers.js";

/**
 * @param {{ viewerUserId: string | null }} input
 */
export async function getUserStoriesFeedForViewer({ viewerUserId }) {
  const { rings } = await fetchUserStoriesFeed(viewerUserId);

  let canPublish = false;
  if (viewerUserId) {
    const user = await UserModel.findById(viewerUserId)
      .select("isPremiumUser userRole isBlockedUser isActiveUser")
      .lean();
    canPublish = canPublishUserStory(user);
  }

  return {
    rings,
    canPublish,
    showStrip: true,
  };
}

/**
 * @param {{ authorUserId: string }} input
 */
export async function getUserStoriesByAuthor({ authorUserId }) {
  const stories = await getActiveStoriesForAuthor(authorUserId);
  return { stories };
}

/**
 * @param {{
 *   authorUserId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function createUserStory({ authorUserId, body }) {
  const user = await UserModel.findById(authorUserId)
    .select("isPremiumUser userRole isBlockedUser isActiveUser")
    .lean();

  if (!canPublishUserStory(user)) {
    throw new AppError(403, "Публикация сторис недоступна");
  }

  if (!isStaffUnlimitedUserStories(user)) {
    try {
      await assertPremiumCanCreateStory(authorUserId);
    } catch (limitError) {
      if (limitError instanceof Error && limitError.message === "ACTIVE_STORY_EXISTS") {
        throw new AppError(
          409,
          "У вас уже есть активный сторис. Дождитесь истечения или удалите его",
        );
      }
      throw limitError;
    }
  }

  const mediaType = normalizeUserStoryMediaType(body?.mediaType);
  const mediaUrl = String(body?.mediaUrl ?? "").trim();
  const captionText = String(body?.captionText ?? "").trim();

  try {
    const story = await createUserStoryRecord({
      authorUserId,
      mediaType,
      mediaUrl,
      captionText,
    });

    return {
      message: "Сторис опубликован",
      story,
    };
  } catch (createError) {
    if (createError instanceof Error && createError.message === "INVALID_MEDIA_URL") {
      throw new AppError(400, "Укажите корректный URL загруженного файла");
    }
    throw createError;
  }
}

/**
 * @param {{
 *   userId: string;
 *   storyId: string;
 * }} input
 */
export async function deleteUserStory({ userId, storyId }) {
  try {
    await deleteOwnUserStory(storyId, userId);
    return { message: "Сторис удалён" };
  } catch (deleteError) {
    if (deleteError instanceof Error) {
      if (deleteError.message === "STORY_NOT_FOUND") {
        throw new AppError(404, "Сторис не найден");
      }
      if (deleteError.message === "FORBIDDEN") {
        throw new AppError(403, "Можно удалять только свои сторисы");
      }
      if (deleteError.message === "STORY_NOT_ACTIVE") {
        throw new AppError(409, "Сторис уже недоступен");
      }
    }
    throw deleteError;
  }
}

/**
 * @param {{
 *   viewerUserId: string;
 *   storyId: string;
 * }} input
 */
export async function markUserStoryViewed({ viewerUserId, storyId }) {
  const story = await UserStoryModel.findById(storyId)
    .select("authorUserId status expiresAt publishedAt")
    .lean();

  if (
    !story ||
    story.status !== USER_STORY_STATUS_ACTIVE ||
    new Date(story.expiresAt) <= new Date()
  ) {
    throw new AppError(404, "Сторис не найден");
  }

  await markUserStoryAuthorViewed(
    viewerUserId,
    String(story.authorUserId),
    story.publishedAt,
  );

  return { message: "Просмотр сохранён" };
}

/**
 * @param {{
 *   reporterId: string;
 *   storyId: string;
 *   reportText: unknown;
 * }} input
 */
export async function submitUserStoryReport({ reporterId, storyId, reportText: rawText }) {
  const reportText = String(rawText ?? "").trim();

  const story = await UserStoryModel.findById(storyId)
    .select("authorUserId status expiresAt")
    .lean();

  if (
    !story ||
    story.status !== USER_STORY_STATUS_ACTIVE ||
    new Date(story.expiresAt) <= new Date()
  ) {
    throw new AppError(404, "Сторис не найден");
  }

  if (String(story.authorUserId) === reporterId) {
    throw new AppError(400, "Нельзя пожаловаться на свой сторис");
  }

  const existingPending = await UserStoryReportModel.findOne({
    storyId,
    reporterUserId: reporterId,
    status: USER_STORY_REPORT_STATUS_PENDING,
  }).lean();

  if (existingPending) {
    throw new AppError(409, USER_STORY_REPORT_ALREADY_MESSAGE);
  }

  try {
    await UserStoryReportModel.create({
      storyId,
      reporterUserId: reporterId,
      reportText,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(409, USER_STORY_REPORT_ALREADY_MESSAGE);
    }
    throw error;
  }

  return { message: "Жалоба принята" };
}

export async function getPendingUserStoryReports() {
  const { groups, totalReports } = await getPendingUserStoryReportGroups();

  return {
    groups,
    totalReports,
    totalGroups: groups.length,
  };
}

export async function countPendingUserStoryReports() {
  const totalReports = await UserStoryReportModel.countDocuments({
    status: USER_STORY_REPORT_STATUS_PENDING,
  });

  return { totalReports };
}

/**
 * @param {{
 *   staffUserId: string;
 *   storyId: string;
 *   resolution: unknown;
 *   staffNote: unknown;
 * }} input
 */
export async function resolveUserStoryReports({
  staffUserId,
  storyId,
  resolution: rawResolution,
  staffNote: rawStaffNote,
}) {
  const resolution = String(rawResolution ?? "").trim();
  const staffNote = String(rawStaffNote ?? "").trim();

  try {
    const result = await resolvePendingUserStoryReports(
      storyId,
      staffUserId,
      staffNote,
      resolution,
    );

    return {
      message: "Жалобы по сторису обработаны",
      resolvedCount: result.resolvedCount,
    };
  } catch (resolveError) {
    if (resolveError instanceof Error) {
      if (resolveError.message === "STORY_NOT_FOUND") {
        throw new AppError(404, "Сторис не найден");
      }
      if (resolveError.message === "NO_PENDING_REPORTS") {
        throw new AppError(409, "Нет необработанных жалоб по этому сторису");
      }
      if (resolveError.message === "INVALID_RESOLUTION") {
        throw new AppError(400, "Недопустимое действие");
      }
    }
    throw resolveError;
  }
}
