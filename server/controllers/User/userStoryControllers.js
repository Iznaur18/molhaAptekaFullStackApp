import {
  countPendingUserStoryReports,
  createUserStory,
  deleteUserStory,
  getPendingUserStoryReports,
  getUserStoriesByAuthor,
  getUserStoriesFeedForViewer,
  markUserStoryViewed,
  resolveUserStoryReports,
  submitUserStoryReport,
} from "../../services/user/userStory.js";
import { successRes } from "../../services/http/index.js";

/** `GET /user/stories/feed` */
export const getUserStoriesFeedController = async (req, res) => {
  const result = await getUserStoriesFeedForViewer({
    viewerUserId: req.userId ? String(req.userId) : null,
  });

  return successRes(res, result);
};

/** `GET /user/stories/author/:userIdClient` */
export const getUserStoriesByAuthorController = async (req, res) => {
  const result = await getUserStoriesByAuthor({
    authorUserId: String(req.params.userIdClient),
  });

  return successRes(res, result);
};

/** `POST /user/stories` */
export const createUserStoryController = async (req, res) => {
  const result = await createUserStory({
    authorUserId: String(req.userId),
    body: req.body,
  });

  return successRes(res, result);
};

/** `DELETE /user/stories/:storyId` */
export const deleteUserStoryController = async (req, res) => {
  const result = await deleteUserStory({
    userId: String(req.userId),
    storyId: req.params.storyId,
  });

  return successRes(res, result);
};

/** `POST /user/stories/:storyId/view` */
export const markUserStoryViewedController = async (req, res) => {
  const result = await markUserStoryViewed({
    viewerUserId: String(req.userId),
    storyId: req.params.storyId,
  });

  return successRes(res, result);
};

/** `POST /user/stories/:storyId/report` */
export const submitUserStoryReportController = async (req, res) => {
  const result = await submitUserStoryReport({
    reporterId: String(req.userId),
    storyId: req.params.storyId,
    reportText: req.body?.reportText,
  });

  return successRes(res, result);
};

/** `GET /user/stories/reports/pending` */
export const getPendingUserStoryReportsController = async (req, res) => {
  const result = await getPendingUserStoryReports();
  return successRes(res, result);
};

/** `GET /user/stories/reports/pending/count` */
export const getPendingUserStoryReportsCountController = async (req, res) => {
  const result = await countPendingUserStoryReports();
  return successRes(res, result);
};

/** `PATCH /user/stories/reports/story/:storyId/resolve` */
export const resolveUserStoryReportsController = async (req, res) => {
  const result = await resolveUserStoryReports({
    staffUserId: req.userId,
    storyId: req.params.storyId,
    resolution: req.body?.resolution,
    staffNote: req.body?.staffNote,
  });

  return successRes(res, result);
};
