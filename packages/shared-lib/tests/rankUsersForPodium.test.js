import assert from "node:assert/strict";
import test from "node:test";

import {
  buildUsersPodiumPlaceById,
  excludeUsersPodiumFromList,
  getUserPodiumAverageRating,
  orderUsersPodiumForDisplay,
  rankUsersForPodium,
  sortUsersByPodiumCriteria,
} from "@izibuy/shared-lib";

test("getUserPodiumAverageRating: zero when no votes", () => {
  assert.equal(getUserPodiumAverageRating(undefined), 0);
  assert.equal(getUserPodiumAverageRating({ countVotes: 0, totalRating: 10 }), 0);
  assert.equal(getUserPodiumAverageRating({ countVotes: 2, totalRating: 9 }), 4.5);
});

test("rankUsersForPodium: lexicographic points → sales → rating → followers", () => {
  const users = [
    {
      _id: "a",
      totalSalesCount: 100,
      followersCount: 100,
      userLoyaltyPoints: 1,
      userRatingByVotes: { countVotes: 10, totalRating: 50 },
    },
    {
      _id: "b",
      totalSalesCount: 1,
      followersCount: 1,
      userLoyaltyPoints: 100,
      userRatingByVotes: { countVotes: 1, totalRating: 1 },
    },
    {
      _id: "c",
      totalSalesCount: 5,
      followersCount: 1,
      userLoyaltyPoints: 100,
      userRatingByVotes: { countVotes: 2, totalRating: 10 },
    },
  ];

  const ranked = rankUsersForPodium(users);
  assert.deepEqual(
    ranked.map((entry) => entry.user._id),
    ["c", "b", "a"],
  );
  assert.deepEqual(
    ranked.map((entry) => entry.place),
    [1, 2, 3],
  );
});

test("rankUsersForPodium: tie-breaks sales after equal points", () => {
  const users = [
    {
      _id: "low-sales",
      userLoyaltyPoints: 50,
      totalSalesCount: 1,
    },
    {
      _id: "high-sales",
      userLoyaltyPoints: 50,
      totalSalesCount: 9,
    },
  ];

  const ranked = rankUsersForPodium(users);
  assert.deepEqual(
    ranked.map((entry) => entry.user._id),
    ["high-sales", "low-sales"],
  );
});

test("rankUsersForPodium: excludes blocked and tie-breaks by _id", () => {
  const users = [
    { _id: "z", userLoyaltyPoints: 3, isBlockedUser: true },
    { _id: "m", userLoyaltyPoints: 3 },
    { _id: "a", userLoyaltyPoints: 3 },
    { _id: "b", userLoyaltyPoints: 1 },
  ];

  const ranked = rankUsersForPodium(users);
  assert.deepEqual(
    ranked.map((entry) => entry.user._id),
    ["a", "m", "b"],
  );
});

test("rankUsersForPodium: returns fewer than 3 when pool is small", () => {
  const ranked = rankUsersForPodium([{ _id: "only", userLoyaltyPoints: 1 }]);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0]?.place, 1);
});

test("sortUsersByPodiumCriteria: sorts full eligible pool", () => {
  const sorted = sortUsersByPodiumCriteria([
    { _id: "third", userLoyaltyPoints: 1 },
    { _id: "first", userLoyaltyPoints: 9 },
    { _id: "blocked", userLoyaltyPoints: 99, isBlockedUser: true },
    { _id: "second", userLoyaltyPoints: 5 },
  ]);

  assert.deepEqual(
    sorted.map((user) => user._id),
    ["first", "second", "third"],
  );
});

test("orderUsersPodiumForDisplay: classic 2-1-3", () => {
  const ordered = orderUsersPodiumForDisplay([
    { place: 1, user: { _id: "first" } },
    { place: 2, user: { _id: "second" } },
    { place: 3, user: { _id: "third" } },
  ]);

  assert.deepEqual(
    ordered.map((entry) => entry.place),
    [2, 1, 3],
  );
});

test("buildUsersPodiumPlaceById: maps ids to places", () => {
  const placeById = buildUsersPodiumPlaceById([
    { _id: "gold", userLoyaltyPoints: 9 },
    { _id: "silver", userLoyaltyPoints: 5 },
    { _id: "bronze", userLoyaltyPoints: 2 },
  ]);

  assert.equal(placeById.get("gold"), 1);
  assert.equal(placeById.get("silver"), 2);
  assert.equal(placeById.get("bronze"), 3);
  assert.equal(placeById.has("missing"), false);
});

test("excludeUsersPodiumFromList: removes podium leaders from general list", () => {
  const users = [
    { _id: "gold", userLoyaltyPoints: 9 },
    { _id: "silver", userLoyaltyPoints: 5 },
    { _id: "bronze", userLoyaltyPoints: 2 },
    { _id: "rest", userLoyaltyPoints: 1 },
  ];
  const podiumEntries = rankUsersForPodium(users);

  assert.deepEqual(
    excludeUsersPodiumFromList(users, podiumEntries).map((user) => user._id),
    ["rest"],
  );
  assert.deepEqual(excludeUsersPodiumFromList(users, []).map((user) => user._id), [
    "gold",
    "silver",
    "bronze",
    "rest",
  ]);
});
