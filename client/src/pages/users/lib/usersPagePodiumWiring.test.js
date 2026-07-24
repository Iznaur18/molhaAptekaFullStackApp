import { describe, expect, it } from "vitest";
import {
  excludeUsersPodiumFromList,
  rankUsersForPodium,
} from "@izibuy/shared-lib";

describe("users page podium wiring", () => {
  it("ranks top-3 and excludes them from list", () => {
    const users = [
      { _id: "a", userLoyaltyPoints: 10, totalSalesCount: 1, userRatingByVotes: { countVotes: 1, totalRating: 5 }, followersCount: 1 },
      { _id: "b", userLoyaltyPoints: 30, totalSalesCount: 2, userRatingByVotes: { countVotes: 2, totalRating: 8 }, followersCount: 2 },
      { _id: "c", userLoyaltyPoints: 20, totalSalesCount: 3, userRatingByVotes: { countVotes: 1, totalRating: 4 }, followersCount: 3 },
      { _id: "d", userLoyaltyPoints: 5, totalSalesCount: 0, userRatingByVotes: { countVotes: 0, totalRating: 0 }, followersCount: 0 },
    ];

    const podium = rankUsersForPodium(users);
    const list = excludeUsersPodiumFromList(users, podium);

    expect(podium.map((entry) => entry.user._id)).toEqual(["b", "c", "a"]);
    expect(list.map((user) => user._id)).toEqual(["d"]);
  });
});
