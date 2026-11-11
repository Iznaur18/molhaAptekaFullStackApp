export const luckyBoxQueryKeys = {
  all: ["lucky-box"],
  stateBySeller: (sellerId) => [...luckyBoxQueryKeys.all, "state", String(sellerId)],
  myConfig: () => [...luckyBoxQueryKeys.all, "me", "config"],
  myWins: () => [...luckyBoxQueryKeys.all, "me", "wins"],
};
