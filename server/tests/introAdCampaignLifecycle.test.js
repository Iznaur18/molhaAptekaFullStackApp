import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import mongoose from "mongoose";

import {
  INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
  INTRO_AD_CAMPAIGN_STATUS_QUEUED,
  INTRO_AD_MAX_ACTIVE,
  INTRO_AD_NOTIFICATION_KIND_EXPIRED,
  INTRO_AD_PRICE_POINTS,
} from "../constants/introAdCampaignConstants.js";
import {
  IntroAdCampaignModel,
  UserInAppNotificationModel,
  UserModel,
} from "../models/index.js";
import {
  activateNextQueuedIntroAdCampaign,
  assertNoOpenIntroAdCampaignForAdvertiser,
  expireIntroAdCampaignsAndActivateQueue,
  fillIntroAdActiveSlotsFromQueue,
  resolvePaidIntrosForPublicPlayback,
} from "../services/intro-ad/introAdCampaignHelpers.js";
import { assertIntroAdMediaUrlsAreUploadedAssets } from "../services/intro-ad/validateIntroAdMediaUrls.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("assertNoOpenIntroAdCampaignForAdvertiser rejects duplicate open campaign", async () => {
  await clearMongoCollections();

  const advertiserId = new mongoose.Types.ObjectId();
  await IntroAdCampaignModel.create({
    advertiserId,
    status: INTRO_AD_CAMPAIGN_STATUS_QUEUED,
    videoMp4Url: "/uploads/test.mp4",
    amountPoints: INTRO_AD_PRICE_POINTS,
  });

  await assert.rejects(
    () => assertNoOpenIntroAdCampaignForAdvertiser(String(advertiserId)),
    /INTRO_AD_CAMPAIGN_ALREADY_OPEN/,
  );
});

test("activateNextQueuedIntroAdCampaign respects scheduledStartAt", async () => {
  await clearMongoCollections();

  const advertiserId = new mongoose.Types.ObjectId();
  const futureStart = new Date(Date.now() + 60 * 60 * 1000);

  await IntroAdCampaignModel.create({
    advertiserId,
    status: INTRO_AD_CAMPAIGN_STATUS_QUEUED,
    videoMp4Url: "/uploads/future.mp4",
    amountPoints: INTRO_AD_PRICE_POINTS,
    scheduledStartAt: futureStart,
  });

  const activated = await activateNextQueuedIntroAdCampaign();
  assert.equal(activated, null);

  const pastAdvertiserId = new mongoose.Types.ObjectId();
  await IntroAdCampaignModel.create({
    advertiserId: pastAdvertiserId,
    status: INTRO_AD_CAMPAIGN_STATUS_QUEUED,
    videoMp4Url: "/uploads/past.mp4",
    amountPoints: INTRO_AD_PRICE_POINTS,
    scheduledStartAt: new Date(Date.now() - 1000),
  });

  const activatedPast = await activateNextQueuedIntroAdCampaign();
  assert.equal(activatedPast?.status, INTRO_AD_CAMPAIGN_STATUS_ACTIVE);
});

test("fillIntroAdActiveSlotsFromQueue activates up to INTRO_AD_MAX_ACTIVE and keeps the rest queued", async () => {
  await clearMongoCollections();

  const overflow = INTRO_AD_MAX_ACTIVE + 1;
  const pastStart = new Date(Date.now() - 1000);

  // Создаём с небольшим сдвигом createdAt через scheduledStartAt, чтобы порядок был детерминированным.
  for (let i = 0; i < overflow; i += 1) {
    await IntroAdCampaignModel.create({
      advertiserId: new mongoose.Types.ObjectId(),
      status: INTRO_AD_CAMPAIGN_STATUS_QUEUED,
      videoMp4Url: `/uploads/queue-${i}.mp4`,
      ctaType: "profile",
      amountPoints: INTRO_AD_PRICE_POINTS,
      scheduledStartAt: new Date(pastStart.getTime() + i),
    });
  }

  await fillIntroAdActiveSlotsFromQueue();

  const activeCount = await IntroAdCampaignModel.countDocuments({
    status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
  });
  const queuedCount = await IntroAdCampaignModel.countDocuments({
    status: INTRO_AD_CAMPAIGN_STATUS_QUEUED,
  });

  assert.equal(activeCount, INTRO_AD_MAX_ACTIVE);
  assert.equal(queuedCount, overflow - INTRO_AD_MAX_ACTIVE);

  const intros = await resolvePaidIntrosForPublicPlayback();
  assert.equal(intros.length, INTRO_AD_MAX_ACTIVE);
});

test("resolvePaidIntrosForPublicPlayback returns active ads even if pausedAt is set", async () => {
  await clearMongoCollections();

  await IntroAdCampaignModel.create({
    advertiserId: new mongoose.Types.ObjectId(),
    status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
    videoMp4Url: "/uploads/paused-legacy.mp4",
    ctaType: "profile",
    amountPoints: INTRO_AD_PRICE_POINTS,
    activatedAt: new Date(Date.now() - 1000),
    activeUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    pausedAt: new Date(Date.now() - 500),
  });

  const intros = await resolvePaidIntrosForPublicPlayback();
  assert.equal(intros.length, 1);
});

test("assertIntroAdMediaUrlsAreUploadedAssets rejects external urls", () => {
  assert.throws(
    () =>
      assertIntroAdMediaUrlsAreUploadedAssets({
        videoMp4Url: "https://evil.example/video.mp4",
      }),
    /INTRO_AD_MEDIA_URL_INVALID/,
  );

  assert.doesNotThrow(() =>
    assertIntroAdMediaUrlsAreUploadedAssets({
      videoMp4Url: "/uploads/video.mp4",
      posterUrl: "/uploads/poster.jpg",
    }),
  );
});

test("expireIntroAdCampaignsAndActivateQueue is idempotent", async () => {
  await clearMongoCollections();

  const advertiserId = new mongoose.Types.ObjectId();
  await IntroAdCampaignModel.create({
    advertiserId,
    status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
    videoMp4Url: "/uploads/expired.mp4",
    amountPoints: INTRO_AD_PRICE_POINTS,
    activeUntil: new Date(Date.now() - 1000),
    activatedAt: new Date(Date.now() - 86400000),
  });

  await Promise.all([
    expireIntroAdCampaignsAndActivateQueue(),
    expireIntroAdCampaignsAndActivateQueue(),
  ]);

  const notifications = await UserInAppNotificationModel.find({
    userId: advertiserId,
    kind: INTRO_AD_NOTIFICATION_KIND_EXPIRED,
  }).lean();

  assert.equal(notifications.length, 1);

  const campaign = await IntroAdCampaignModel.findOne({ advertiserId }).lean();
  assert.equal(campaign?.status, "expired");
});

test("partial unique index blocks second open campaign for advertiser", async () => {
  await clearMongoCollections();

  const advertiserId = new mongoose.Types.ObjectId();
  await UserModel.create({
    userName: "intro-ad-test",
    email: "intro-ad-test@example.com",
    passwordHash: "hash",
  });

  await IntroAdCampaignModel.create({
    advertiserId,
    status: INTRO_AD_CAMPAIGN_STATUS_QUEUED,
    videoMp4Url: "/uploads/a.mp4",
    amountPoints: INTRO_AD_PRICE_POINTS,
  });

  await assert.rejects(
    () =>
      IntroAdCampaignModel.create({
        advertiserId,
        status: INTRO_AD_CAMPAIGN_STATUS_QUEUED,
        videoMp4Url: "/uploads/b.mp4",
        amountPoints: INTRO_AD_PRICE_POINTS,
      }),
    (error) =>
      error && typeof error === "object" && "code" in error && error.code === 11000,
  );
});
