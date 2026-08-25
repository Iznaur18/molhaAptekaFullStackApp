export const adminAnalyticsQueryKeys = {
  all: ["admin-analytics"],
  overview: (period) => [...adminAnalyticsQueryKeys.all, "overview", period],
};
