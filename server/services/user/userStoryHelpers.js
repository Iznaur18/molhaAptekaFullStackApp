import { isPremiumActive } from "./premiumAccess.js";
import {
  IN_APP_NOTIFICATION_KIND_STORY_HIDDEN,
  IN_APP_NOTIFICATION_MESSAGE_STORY_HIDDEN,
  USER_STORY_AUTHOR_PUBLIC_SELECT,
  USER_STORY_CAPTION_MAX_CHARS,
  USER_STORY_MEDIA_TYPE_IMAGE,
  USER_STORY_MEDIA_TYPE_VIDEO,
  USER_STORY_REPORT_RESOLUTION_DISMISS,
  USER_STORY_REPORT_RESOLUTION_HIDE,
  USER_STORY_REPORT_STATUS_DISMISSED,
  USER_STORY_REPORT_STATUS_PENDING,
  USER_STORY_REPORT_STATUS_RESOLVED,
  USER_STORY_STATUS_ACTIVE,
  USER_STORY_STATUS_EXPIRED,
  USER_STORY_STATUS_HIDDEN,
  USER_STORY_TTL_MS,
} from "../../constants/userStoryConstants.js";
import {
  UserModel,
  UserStoryModel,
  UserStoryReportModel,
  UserStoryViewModel,
} from "../../models/index.js";
import { normalizeStoredUploadUrl } from "../upload/buildPublicUploadUrl.js";
import { canModerateProductsRole } from "../product/productModeration.js";
import { deleteUploadFileByUrl } from "../upload/deleteUploadFileByUrl.js";
import { createUserInAppNotification } from "./userInAppNotifications.js";

const UPLOAD_PATH_PREFIX = "/uploads/";

/**
 * @param {Record<string, unknown> | null | undefined} user
 */
export function canPublishUserStory(user) {
  if (!user || user.isBlockedUser === true || user.isActiveUser === false) {
    return false;
  }
  if (canModerateProductsRole(user.userRole)) {
    return true;
  }
  return isPremiumActive(user);
}

/**
 * @param {Record<string, unknown> | null | undefined} user
 */
export function isStaffUnlimitedUserStories(user) {
  return canModerateProductsRole(user?.userRole);
}

/**
 * @param {unknown} value
 */
export function assertUserStoryMediaUrl(value) {
  const url = normalizeStoredUploadUrl(String(value ?? "").trim());
  if (!url.includes(UPLOAD_PATH_PREFIX)) {
    throw new Error("INVALID_MEDIA_URL");
  }
  return url;
}

/**
 * @param {unknown} raw
 */
export function normalizeUserStoryMediaType(raw) {
  const value = String(raw ?? "").trim();
  if (value === USER_STORY_MEDIA_TYPE_VIDEO) {
    return USER_STORY_MEDIA_TYPE_VIDEO;
  }
  return USER_STORY_MEDIA_TYPE_IMAGE;
}

/**
 * @param {import('mongoose').Document | Record<string, unknown>} story
 */
export function mapUserStoryToPublic(story) {
  return {
    _id: String(story._id),
    authorUserId: String(story.authorUserId),
    mediaType: story.mediaType,
    mediaUrl: story.mediaUrl,
    captionText: story.captionText ?? "",
    publishedAt: story.publishedAt,
    expiresAt: story.expiresAt,
  };
}

/**
 * @param {Date} [now]
 */
export async function expireStaleUserStories(now = new Date()) {
  const staleStories = await UserStoryModel.find({
    status: USER_STORY_STATUS_ACTIVE,
    expiresAt: { $lte: now },
  }).lean();

  if (staleStories.length === 0) {
    return 0;
  }

  const ids = staleStories.map((story) => story._id);
  await UserStoryModel.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        status: USER_STORY_STATUS_EXPIRED,
      },
    },
  );

  await Promise.all(staleStories.map((story) => deleteUploadFileByUrl(story.mediaUrl)));

  return staleStories.length;
}

/**
 * @param {string} storyId
 */
export async function hideUserStoryAndDeleteMedia(storyId) {
  const story = await UserStoryModel.findById(storyId);
  if (!story) {
    throw new Error("STORY_NOT_FOUND");
  }

  if (story.status === USER_STORY_STATUS_HIDDEN) {
    return story;
  }

  story.status = USER_STORY_STATUS_HIDDEN;
  story.hiddenAt = new Date();
  await story.save();
  await deleteUploadFileByUrl(story.mediaUrl);

  return story;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} authorUserId
 */
export async function assertPremiumCanCreateStory(authorUserId) {
  const activeCount = await UserStoryModel.countDocuments({
    authorUserId,
    status: USER_STORY_STATUS_ACTIVE,
    expiresAt: { $gt: new Date() },
  });

  if (activeCount > 0) {
    throw new Error("ACTIVE_STORY_EXISTS");
  }
}

/**
 * @param {{
 *   authorUserId: import('mongoose').Types.ObjectId | string;
 *   mediaType: string;
 *   mediaUrl: string;
 *   captionText?: string;
 * }} params
 */
export async function createUserStoryRecord({
  authorUserId,
  mediaType,
  mediaUrl,
  captionText = "",
}) {
  const now = new Date();
  const story = await UserStoryModel.create({
    authorUserId,
    mediaType: normalizeUserStoryMediaType(mediaType),
    mediaUrl: assertUserStoryMediaUrl(mediaUrl),
    captionText: String(captionText ?? "")
      .trim()
      .slice(0, USER_STORY_CAPTION_MAX_CHARS),
    status: USER_STORY_STATUS_ACTIVE,
    publishedAt: now,
    expiresAt: new Date(now.getTime() + USER_STORY_TTL_MS),
  });

  return mapUserStoryToPublic(story.toObject());
}

/**
 * @param {string | null | undefined} viewerUserId
 */
export async function getUserStoriesFeed(viewerUserId) {
  await expireStaleUserStories();

  const now = new Date();
  const activeStories = await UserStoryModel.find({
    status: USER_STORY_STATUS_ACTIVE,
    expiresAt: { $gt: now },
  })
    .sort({ publishedAt: -1 })
    .lean();

  const storiesByAuthor = new Map();
  for (const story of activeStories) {
    const authorId = String(story.authorUserId);
    if (!storiesByAuthor.has(authorId)) {
      storiesByAuthor.set(authorId, []);
    }
    storiesByAuthor.get(authorId).push(story);
  }

  const authorIds = [...storiesByAuthor.keys()];
  const authors =
    authorIds.length > 0
      ? await UserModel.find({ _id: { $in: authorIds } })
          .select(USER_STORY_AUTHOR_PUBLIC_SELECT)
          .lean()
      : [];
  const authorsById = Object.fromEntries(
    authors.map((author) => [String(author._id), author]),
  );

  let lastViewedPublishedAtByAuthor = new Map();
  if (viewerUserId) {
    const views = await UserStoryViewModel.find({
      viewerUserId,
      authorUserId: { $in: authorIds },
    })
      .select("authorUserId viewedAt")
      .lean();
    lastViewedPublishedAtByAuthor = new Map(
      views.map((view) => [String(view.authorUserId), view.viewedAt]),
    );
  }

  const rings = authorIds
    .map((authorId) => {
      const author = authorsById[authorId];
      if (!author) {
        return null;
      }

      const authorStories = storiesByAuthor.get(authorId) ?? [];
      const isOwn = viewerUserId ? authorId === String(viewerUserId) : false;
      const latestPublishedAt = authorStories[0]?.publishedAt ?? null;
      const lastViewedPublishedAt = lastViewedPublishedAtByAuthor.get(authorId) ?? null;
      const isViewed =
        isOwn ||
        (lastViewedPublishedAt != null &&
          latestPublishedAt != null &&
          new Date(lastViewedPublishedAt).getTime() >=
            new Date(latestPublishedAt).getTime());

      return {
        author: {
          _id: authorId,
          userName: author.userName ?? "",
          userAvatarUrl: author.userAvatarUrl ?? "",
          userAvatarFocus: author.userAvatarFocus ?? null,
          isPremiumUser: Boolean(author.isPremiumUser),
        },
        activeCount: authorStories.length,
        isViewed,
        isOwn,
        latestPublishedAt,
      };
    })
    .filter(Boolean);

  rings.sort((left, right) => {
    if (viewerUserId) {
      if (left.isViewed !== right.isViewed) {
        return left.isViewed ? 1 : -1;
      }
    }
    const leftTime = new Date(left.latestPublishedAt ?? 0).getTime();
    const rightTime = new Date(right.latestPublishedAt ?? 0).getTime();
    return rightTime - leftTime;
  });

  return { rings };
}

/**
 * @param {string} authorUserId
 */
export async function getActiveStoriesForAuthor(authorUserId) {
  await expireStaleUserStories();

  const now = new Date();
  const stories = await UserStoryModel.find({
    authorUserId,
    status: USER_STORY_STATUS_ACTIVE,
    expiresAt: { $gt: now },
  })
    .sort({ publishedAt: 1 })
    .lean();

  return stories.map(mapUserStoryToPublic);
}

/**
 * @param {string} viewerUserId
 * @param {string} authorUserId
 * @param {Date | string} storyPublishedAt
 */
export async function markUserStoryAuthorViewed(
  viewerUserId,
  authorUserId,
  storyPublishedAt,
) {
  if (viewerUserId === authorUserId) {
    return;
  }

  const publishedAt = new Date(storyPublishedAt);
  await UserStoryViewModel.findOneAndUpdate(
    { viewerUserId, authorUserId },
    {
      $max: { viewedAt: publishedAt },
      $setOnInsert: { viewerUserId, authorUserId },
    },
    { upsert: true, returnDocument: "after" },
  );
}

/**
 * @param {string} storyId
 * @param {string} userId
 */
export async function deleteOwnUserStory(storyId, userId) {
  const story = await UserStoryModel.findById(storyId);
  if (!story) {
    throw new Error("STORY_NOT_FOUND");
  }

  if (String(story.authorUserId) !== userId) {
    throw new Error("FORBIDDEN");
  }

  if (story.status !== USER_STORY_STATUS_ACTIVE) {
    throw new Error("STORY_NOT_ACTIVE");
  }

  story.status = USER_STORY_STATUS_EXPIRED;
  await story.save();
  await deleteUploadFileByUrl(story.mediaUrl);
}

const REPORTER_PUBLIC_SELECT = "_id userName";

/**
 * @returns {Promise<{
 *   groups: Array<{
 *     story: Record<string, unknown>;
 *     author: Record<string, unknown>;
 *     reportCount: number;
 *     reports: Array<Record<string, unknown>>;
 *   }>;
 *   totalReports: number;
 * }>}
 */
export async function getPendingUserStoryReportGroups() {
  const rows = await UserStoryReportModel.aggregate([
    { $match: { status: USER_STORY_REPORT_STATUS_PENDING } },
    {
      $group: {
        _id: "$storyId",
        reportCount: { $sum: 1 },
        reports: {
          $push: {
            _id: "$_id",
            reportText: "$reportText",
            createdAt: "$createdAt",
            reporterUserId: "$reporterUserId",
          },
        },
      },
    },
    { $sort: { reportCount: -1 } },
  ]);

  if (rows.length === 0) {
    return { groups: [], totalReports: 0 };
  }

  const storyIds = rows.map((row) => row._id);
  const stories = await UserStoryModel.find({ _id: { $in: storyIds } }).lean();
  const storiesById = Object.fromEntries(
    stories.map((story) => [String(story._id), story]),
  );

  const authorIds = [...new Set(stories.map((story) => String(story.authorUserId)))];
  const authors = await UserModel.find({ _id: { $in: authorIds } })
    .select(USER_STORY_AUTHOR_PUBLIC_SELECT)
    .lean();
  const authorsById = Object.fromEntries(
    authors.map((author) => [String(author._id), author]),
  );

  const reporterIds = [
    ...new Set(
      rows.flatMap((row) => row.reports.map((report) => String(report.reporterUserId))),
    ),
  ];
  const reporters = await UserModel.find({ _id: { $in: reporterIds } })
    .select(REPORTER_PUBLIC_SELECT)
    .lean();
  const reportersById = Object.fromEntries(
    reporters.map((user) => [String(user._id), user]),
  );

  let totalReports = 0;
  const groups = rows
    .map((row) => {
      const story = storiesById[String(row._id)];
      if (!story) {
        return null;
      }

      const author = authorsById[String(story.authorUserId)] ?? {
        _id: String(story.authorUserId),
      };

      totalReports += row.reportCount;
      const reports = row.reports
        .map((report) => ({
          _id: String(report._id),
          reportText: report.reportText,
          createdAt: report.createdAt,
          reporter: reportersById[String(report.reporterUserId)] ?? {
            _id: String(report.reporterUserId),
          },
        }))
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      return {
        story: mapUserStoryToPublic(story),
        author,
        reportCount: row.reportCount,
        reports,
      };
    })
    .filter(Boolean);

  return { groups, totalReports };
}

/**
 * @param {string} storyId
 * @param {import('mongoose').Types.ObjectId | string} staffUserId
 * @param {string} staffNote
 * @param {'dismiss' | 'hide'} resolution
 */
export async function resolvePendingUserStoryReports(
  storyId,
  staffUserId,
  staffNote,
  resolution,
) {
  const allowed = new Set([
    USER_STORY_REPORT_RESOLUTION_DISMISS,
    USER_STORY_REPORT_RESOLUTION_HIDE,
  ]);
  if (!allowed.has(resolution)) {
    throw new Error("INVALID_RESOLUTION");
  }

  const story = await UserStoryModel.findById(storyId);
  if (!story) {
    throw new Error("STORY_NOT_FOUND");
  }

  const pendingReports = await UserStoryReportModel.find({
    storyId,
    status: USER_STORY_REPORT_STATUS_PENDING,
  }).lean();

  if (pendingReports.length === 0) {
    throw new Error("NO_PENDING_REPORTS");
  }

  const now = new Date();
  const nextStatus =
    resolution === USER_STORY_REPORT_RESOLUTION_DISMISS
      ? USER_STORY_REPORT_STATUS_DISMISSED
      : USER_STORY_REPORT_STATUS_RESOLVED;

  if (resolution === USER_STORY_REPORT_RESOLUTION_HIDE) {
    await hideUserStoryAndDeleteMedia(storyId);
    await createUserInAppNotification({
      userId: story.authorUserId,
      kind: IN_APP_NOTIFICATION_KIND_STORY_HIDDEN,
      message: IN_APP_NOTIFICATION_MESSAGE_STORY_HIDDEN,
      actorUserId: staffUserId,
    });
  }

  await UserStoryReportModel.updateMany(
    { storyId, status: USER_STORY_REPORT_STATUS_PENDING },
    {
      $set: {
        status: nextStatus,
        staffNote,
        reviewedBy: staffUserId,
        reviewedAt: now,
      },
    },
  );

  return { resolvedCount: pendingReports.length };
}
