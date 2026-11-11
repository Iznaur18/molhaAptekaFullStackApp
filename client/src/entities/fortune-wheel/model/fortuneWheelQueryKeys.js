export const fortuneWheelQueryKeys = {
  all: ["fortune-wheel"],
  stateBySeller: (sellerId) => [
    ...fortuneWheelQueryKeys.all,
    "state",
    String(sellerId),
  ],
  myConfig: () => [...fortuneWheelQueryKeys.all, "me", "config"],
  myWins: () => [...fortuneWheelQueryKeys.all, "me", "wins"],
};
