export const userProfileQueryKeys = {
  all: ["user", "profile"] as const,
  byId: (userId: string) => [...userProfileQueryKeys.all, userId] as const,
};
