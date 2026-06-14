export const userVoteQueryKeys = {
  all: ["user-vote"] as const,
  myForTarget: (targetUserId: string) =>
    [...userVoteQueryKeys.all, "me", targetUserId] as const,
};
