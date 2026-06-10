export const introAdQueryKeys = {
  all: ["intro-ad"],
  myCampaign: () => [...introAdQueryKeys.all, "my-campaign"],
  moderationPending: (limit) => [...introAdQueryKeys.all, "moderation-pending", limit],
  moderationManaged: () => [...introAdQueryKeys.all, "moderation-managed"],
  moderationCount: () => [...introAdQueryKeys.all, "moderation-count"],
};
