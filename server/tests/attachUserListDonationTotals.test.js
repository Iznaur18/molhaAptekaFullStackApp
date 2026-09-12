import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { PaymentModel, UserModel } = await import("../models/index.js");
const { attachUserListDonationTotals } =
  await import("../services/user/attachUserListDonationTotals.js");

describe("attachUserListDonationTotals", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("sums succeeded donations per user for all time", async () => {
    const donor = await UserModel.create({
      userName: "donor-a",
      email: "donor-a@example.com",
      passwordHash: "x".repeat(60),
      userLoyaltyPoints: 0,
    });
    const other = await UserModel.create({
      userName: "donor-b",
      email: "donor-b@example.com",
      passwordHash: "x".repeat(60),
      userLoyaltyPoints: 0,
    });

    await PaymentModel.create([
      {
        userId: donor._id,
        purpose: "users_monthly_donation",
        amountRub: 100,
        status: "succeeded",
        idempotenceKey: "don-a-1",
        providerPaymentId: "yk-a-1",
        appliedAt: new Date(),
        appliedAmount: 100,
      },
      {
        userId: donor._id,
        purpose: "users_monthly_donation",
        amountRub: 50,
        status: "succeeded",
        idempotenceKey: "don-a-2",
        providerPaymentId: "yk-a-2",
        appliedAt: new Date(),
        appliedAmount: 50,
      },
      {
        userId: donor._id,
        purpose: "users_monthly_donation",
        amountRub: 999,
        status: "created",
        idempotenceKey: "don-a-open",
        providerPaymentId: "yk-a-open",
      },
      {
        userId: other._id,
        purpose: "users_monthly_donation",
        amountRub: 10,
        status: "succeeded",
        idempotenceKey: "don-b-1",
        providerPaymentId: "yk-b-1",
        appliedAt: new Date(),
        appliedAmount: 10,
      },
    ]);

    const result = await attachUserListDonationTotals([
      { _id: donor._id, userName: "donor-a" },
      { _id: other._id, userName: "donor-b" },
      { _id: "000000000000000000000099", userName: "none" },
    ]);

    assert.equal(result[0].totalDonatedRub, 150);
    assert.equal(result[1].totalDonatedRub, 10);
    assert.equal(result[2].totalDonatedRub, 0);
  });
});
