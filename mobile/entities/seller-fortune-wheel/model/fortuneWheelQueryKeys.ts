export const fortuneWheelQueryKeys = {
  all: ["fortune-wheel"] as const,
  stateBySeller: (sellerId: string) =>
    [...fortuneWheelQueryKeys.all, "state", String(sellerId)] as const,
  myWins: () => [...fortuneWheelQueryKeys.all, "me", "wins"] as const,
};
