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

test("rankUsersForPodium: sorts by totalDonatedRub desc", () => {
  const users = [
    { _id: "a", totalDonatedRub: 10 },
    { _id: "b", totalDonatedRub: 100 },
    { _id: "c", totalDonatedRub: 50 },
  ];

  const ranked = rankUsersForPodium(users);
  assert.deepEqual(
    ranked.map((entry) => entry.user._id),
    ["b", "c", "a"],
  );
  assert.deepEqual(
    ranked.map((entry) => entry.place),
    [1, 2, 3],
  );
});

test("rankUsersForPodium: tie-breaks by _id when donations equal", () => {
  const users = [
    { _id: "z", totalDonatedRub: 50 },
    { _id: "a", totalDonatedRub: 50 },
  ];

  const ranked = rankUsersForPodium(users);
  assert.deepEqual(
    ranked.map((entry) => entry.user._id),
    ["a", "z"],
  );
});

test("rankUsersForPodium: excludes blocked and tie-breaks by _id", () => {
  const users = [
    { _id: "z", totalDonatedRub: 3, isBlockedUser: true },
    { _id: "m", totalDonatedRub: 3 },
    { _id: "a", totalDonatedRub: 3 },
    { _id: "b", totalDonatedRub: 1 },
  ];

  const ranked = rankUsersForPodium(users);
  assert.deepEqual(
    ranked.map((entry) => entry.user._id),
    ["a", "m", "b"],
  );
});

test("rankUsersForPodium: returns fewer than 3 when pool is small", () => {
  const ranked = rankUsersForPodium([{ _id: "only", totalDonatedRub: 1 }]);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0]?.place, 1);
});

test("sortUsersByPodiumCriteria: sorts full eligible pool", () => {
  const sorted = sortUsersByPodiumCriteria([
    { _id: "third", totalDonatedRub: 1 },
    { _id: "first", totalDonatedRub: 9 },
    { _id: "blocked", totalDonatedRub: 99, isBlockedUser: true },
    { _id: "second", totalDonatedRub: 5 },
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
    { _id: "gold", totalDonatedRub: 9 },
    { _id: "silver", totalDonatedRub: 5 },
    { _id: "bronze", totalDonatedRub: 2 },
  ]);

  assert.equal(placeById.get("gold"), 1);
  assert.equal(placeById.get("silver"), 2);
  assert.equal(placeById.get("bronze"), 3);
  assert.equal(placeById.has("missing"), false);
});

test("excludeUsersPodiumFromList: removes podium leaders from general list", () => {
  const users = [
    { _id: "gold", totalDonatedRub: 9 },
    { _id: "silver", totalDonatedRub: 5 },
    { _id: "bronze", totalDonatedRub: 2 },
    { _id: "rest", totalDonatedRub: 1 },
  ];
  const podiumEntries = rankUsersForPodium(users);

  assert.deepEqual(
    excludeUsersPodiumFromList(users, podiumEntries).map((user) => user._id),
    ["rest"],
  );
  assert.deepEqual(
    excludeUsersPodiumFromList(users, []).map((user) => user._id),
    ["gold", "silver", "bronze", "rest"],
  );
});
