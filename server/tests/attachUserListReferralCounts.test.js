import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { UserModel } = await import("../models/index.js");
const { attachUserListReferralCounts } =
  await import("../services/user/attachUserListReferralCounts.js");

/** @param {string} name @param {Record<string, unknown>} [extra] */
const createUser = (name, extra = {}) =>
  UserModel.create({
    userName: name,
    email: `${name}@example.com`,
    passwordHash: "x".repeat(60),
    userLoyaltyPoints: 0,
    ...extra,
  });

describe("attachUserListReferralCounts", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("counts users registered by each referrer", async () => {
    const referrer = await createUser("ref-a");
    const lonely = await createUser("ref-b");
    await createUser("invited-1", { referredByUserId: referrer._id });
    await createUser("invited-2", { referredByUserId: referrer._id });

    const rows = await attachUserListReferralCounts([
      { _id: referrer._id },
      { _id: lonely._id },
    ]);

    assert.equal(rows[0].referredUsersCount, 2);
    assert.equal(rows[1].referredUsersCount, 0);
  });

  it("returns zero for rows without a valid id", async () => {
    const rows = await attachUserListReferralCounts([{ _id: "not-an-id" }]);
    assert.equal(rows[0].referredUsersCount, 0);
  });
});
