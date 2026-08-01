import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { REFERRAL_SOURCE_KIND_PREMIUM } from "../constants/referralConstants.js";
import { PREMIUM_PRICE_POINTS } from "../constants/premiumConstants.js";
import { ReferralLedgerEntryModel, UserModel } from "../models/index.js";
import {
  attachReferralAttribution,
  computeReferralCashbackAmount,
  creditReferralCashbackFromSpend,
  ensureUserReferralCode,
  getMyReferralProgram,
  migratePartnerBalanceToLoyaltyPoints,
  reverseReferralCashbackForSource,
} from "../services/referral/index.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
  await ReferralLedgerEntryModel.syncIndexes();
  await UserModel.syncIndexes();
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("referral: multiple users may have null referralCode", async () => {
  await UserModel.create({
    email: "null-code-a@example.com",
    passwordHash: "x",
    userName: "nullcodea",
    userAvatarUrl: "https://example.com/a.png",
    userBackgroundUrl: "preset:mist",
  });
  await UserModel.create({
    email: "null-code-b@example.com",
    passwordHash: "x",
    userName: "nullcodeb",
    userAvatarUrl: "https://example.com/a.png",
    userBackgroundUrl: "preset:mist",
  });
  const count = await UserModel.countDocuments({ referralCode: null });
  assert.ok(count >= 2);
});

test("referral: attribution + credit loyalty + reverse", async () => {
  const referrer = await UserModel.create({
    email: "ref-owner@example.com",
    passwordHash: "x",
    userName: "refowner",
    userAvatarUrl: "https://example.com/a.png",
    userBackgroundUrl: "preset:mist",
    userLoyaltyPoints: 0,
  });
  const code = await ensureUserReferralCode(String(referrer._id));
  assert.ok(code);

  const referred = await UserModel.create({
    email: "ref-child@example.com",
    passwordHash: "x",
    userName: "refchild",
    userAvatarUrl: "https://example.com/a.png",
    userBackgroundUrl: "preset:mist",
  });

  const attached = await attachReferralAttribution({
    userId: String(referred._id),
    referralCode: code,
  });
  assert.equal(attached.attached, true);

  const again = await attachReferralAttribution({
    userId: String(referred._id),
    referralCode: code,
  });
  assert.equal(again.attached, false);

  const sourceId = `premium:${referred._id}:test`;
  const credit = await creditReferralCashbackFromSpend({
    spenderUserId: String(referred._id),
    pointsSpent: PREMIUM_PRICE_POINTS,
    sourceKind: REFERRAL_SOURCE_KIND_PREMIUM,
    sourceId,
  });
  const expected = computeReferralCashbackAmount(PREMIUM_PRICE_POINTS);
  assert.equal(credit.credited, true);
  assert.equal(credit.amount, expected);

  const referrerAfter = await UserModel.findById(referrer._id)
    .select("userLoyaltyPoints partnerBalance")
    .lean();
  assert.equal(Number(referrerAfter.userLoyaltyPoints), expected);
  assert.equal(Number(referrerAfter.partnerBalance) || 0, 0);

  const creditDup = await creditReferralCashbackFromSpend({
    spenderUserId: String(referred._id),
    pointsSpent: PREMIUM_PRICE_POINTS,
    sourceKind: REFERRAL_SOURCE_KIND_PREMIUM,
    sourceId,
  });
  assert.equal(creditDup.duplicate, true);

  const reversed = await reverseReferralCashbackForSource({
    sourceKind: REFERRAL_SOURCE_KIND_PREMIUM,
    sourceId,
  });
  assert.equal(reversed.reversed, true);

  const referrerFinal = await UserModel.findById(referrer._id)
    .select("userLoyaltyPoints")
    .lean();
  assert.equal(Number(referrerFinal.userLoyaltyPoints), 0);

  const ledgerCount = await ReferralLedgerEntryModel.countDocuments({
    referrerUserId: referrer._id,
  });
  assert.equal(ledgerCount, 2);

  const dash = await getMyReferralProgram(String(referrer._id));
  assert.equal(dash.loyaltyPointsBalance, 0);
  assert.equal(dash.totalReferralsSpend, 0);
  assert.equal(dash.totalCashbackEarned, 0);
});

test("referral: reverse fails when free loyalty already spent", async () => {
  const referrer = await UserModel.create({
    email: "ref-rev-spent@example.com",
    passwordHash: "x",
    userName: "refrevspent",
    userAvatarUrl: "https://example.com/a.png",
    userBackgroundUrl: "preset:mist",
    userLoyaltyPoints: 0,
  });
  const referred = await UserModel.create({
    email: "ref-rev-spent-buyer@example.com",
    passwordHash: "x",
    userName: "refrevspentb",
    userAvatarUrl: "https://example.com/a.png",
    userBackgroundUrl: "preset:mist",
    referredByUserId: referrer._id,
  });

  const sourceId = `premium:${referred._id}:already-spent`;
  const amount = computeReferralCashbackAmount(PREMIUM_PRICE_POINTS);
  await creditReferralCashbackFromSpend({
    spenderUserId: String(referred._id),
    pointsSpent: PREMIUM_PRICE_POINTS,
    sourceKind: REFERRAL_SOURCE_KIND_PREMIUM,
    sourceId,
  });

  await UserModel.updateOne({ _id: referrer._id }, { $set: { userLoyaltyPoints: 0 } });

  await assert.rejects(
    () =>
      reverseReferralCashbackForSource({
        sourceKind: REFERRAL_SOURCE_KIND_PREMIUM,
        sourceId,
      }),
    (error) =>
      error?.name === "InsufficientPartnerBalanceForReversalError" &&
      error.required === amount,
  );
});

test("referral: migratePartnerBalanceToLoyaltyPoints is idempotent", async () => {
  const user = await UserModel.create({
    email: "ref-migrate@example.com",
    passwordHash: "x",
    userName: "refmigrate",
    userAvatarUrl: "https://example.com/a.png",
    userBackgroundUrl: "preset:mist",
    partnerBalance: 71,
    userLoyaltyPoints: 10,
  });

  const first = await migratePartnerBalanceToLoyaltyPoints(String(user._id));
  assert.equal(first, 71);
  const afterFirst = await UserModel.findById(user._id)
    .select("partnerBalance userLoyaltyPoints")
    .lean();
  assert.equal(Number(afterFirst.partnerBalance) || 0, 0);
  assert.equal(Number(afterFirst.userLoyaltyPoints), 81);

  const second = await migratePartnerBalanceToLoyaltyPoints(String(user._id));
  assert.equal(second, 0);
  const afterSecond = await UserModel.findById(user._id)
    .select("partnerBalance userLoyaltyPoints")
    .lean();
  assert.equal(Number(afterSecond.partnerBalance) || 0, 0);
  assert.equal(Number(afterSecond.userLoyaltyPoints), 81);
});
