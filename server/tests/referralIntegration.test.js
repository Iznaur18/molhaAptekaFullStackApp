import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { REFERRAL_SOURCE_KIND_PREMIUM } from "../constants/referralConstants.js";
import { PREMIUM_PRICE_POINTS } from "../constants/premiumConstants.js";
import { ReferralLedgerEntryModel, UserModel } from "../models/index.js";
import {
  attachReferralAttribution,
  computeReferralCashbackAmount,
  convertPartnerBalanceToLoyalty,
  creditReferralCashbackFromSpend,
  ensureUserReferralCode,
  getMyReferralProgram,
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

test("referral: attribution + credit + reverse", async () => {
  const referrer = await UserModel.create({
    email: "ref-owner@example.com",
    passwordHash: "x",
    userName: "refowner",
    userAvatarUrl: "https://example.com/a.png",
    userBackgroundUrl: "preset:mist",
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
    .select("partnerBalance")
    .lean();
  assert.equal(Number(referrerAfter.partnerBalance), expected);

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
    .select("partnerBalance")
    .lean();
  assert.equal(Number(referrerFinal.partnerBalance), 0);

  const ledgerCount = await ReferralLedgerEntryModel.countDocuments({
    referrerUserId: referrer._id,
  });
  assert.equal(ledgerCount, 2);

  const dash = await getMyReferralProgram(String(referrer._id));
  assert.equal(dash.partnerBalance, 0);
  assert.equal(dash.totalReferralsSpend, 0);
  assert.equal(dash.totalCashbackEarned, 0);
});

test("referral: convert is idempotent by key", async () => {
  const referrer = await UserModel.create({
    email: "ref-convert@example.com",
    passwordHash: "x",
    userName: "refconvert",
    userAvatarUrl: "https://example.com/a.png",
    userBackgroundUrl: "preset:mist",
    partnerBalance: 50,
    userLoyaltyPoints: 10,
  });

  const first = await convertPartnerBalanceToLoyalty({
    userId: String(referrer._id),
    amount: 20,
    idempotencyKey: "client-retry-1",
  });
  assert.equal(first.converted, 20);
  assert.equal(first.partnerBalance, 30);
  assert.equal(first.loyaltyPointsBalance, 30);

  const second = await convertPartnerBalanceToLoyalty({
    userId: String(referrer._id),
    amount: 20,
    idempotencyKey: "client-retry-1",
  });
  assert.equal(second.duplicate, true);
  assert.equal(second.converted, 20);
  assert.equal(second.partnerBalance, 30);
  assert.equal(second.loyaltyPointsBalance, 30);

  const third = await convertPartnerBalanceToLoyalty({
    userId: String(referrer._id),
    amount: 10,
    idempotencyKey: "client-retry-2",
  });
  assert.equal(third.converted, 10);
  assert.equal(third.partnerBalance, 20);
  assert.equal(third.loyaltyPointsBalance, 40);
});
