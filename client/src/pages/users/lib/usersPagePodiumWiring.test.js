import { describe, expect, it } from "vitest";
import { excludeUsersPodiumFromList, rankUsersForPodium } from "@izibuy/shared-lib";

describe("users page podium wiring", () => {
  it("ranks top-3 by donations and excludes them from list", () => {
    const users = [
      { _id: "a", totalDonatedRub: 10 },
      { _id: "b", totalDonatedRub: 30 },
      { _id: "c", totalDonatedRub: 20 },
      { _id: "d", totalDonatedRub: 5 },
    ];

    const podium = rankUsersForPodium(users);
    const list = excludeUsersPodiumFromList(users, podium);

    expect(podium.map((entry) => entry.user._id)).toEqual(["b", "c", "a"]);
    expect(list.map((user) => user._id)).toEqual(["d"]);
  });
});
