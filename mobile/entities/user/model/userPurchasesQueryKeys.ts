export const userPurchasesQueryKeys = {
  all: ["user", "purchases"] as const,
  byUserId: (userId: string) => [...userPurchasesQueryKeys.all, userId] as const,
};
