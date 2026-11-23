export const luckyBoxQueryKeys = {
  all: ["lucky-box"] as const,
  stateBySeller: (sellerId: string) =>
    [...luckyBoxQueryKeys.all, "state", String(sellerId)] as const,
  myConfig: () => [...luckyBoxQueryKeys.all, "me", "config"] as const,
  myWins: () => [...luckyBoxQueryKeys.all, "me", "wins"] as const,
};
