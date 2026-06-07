export const userStoryReportQueryKeys = {
  all: ["user-story", "reports"],
  pending: () => [...userStoryReportQueryKeys.all, "pending"],
  pendingCount: () => [...userStoryReportQueryKeys.all, "pending", "count"],
};
