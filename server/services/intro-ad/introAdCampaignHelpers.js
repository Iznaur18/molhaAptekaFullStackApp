import { APP_INTRO_SETTINGS_KEY } from "../../constants/appIntroSettingsConstants.js";
import {
  INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
  INTRO_AD_CAMPAIGN_STATUS_CANCELLED,
  INTRO_AD_CAMPAIGN_STATUS_EXPIRED,
  INTRO_AD_CAMPAIGN_OPEN_STATUSES,
  INTRO_AD_CAMPAIGN_STATUS_PENDING,
  INTRO_AD_CAMPAIGN_STATUS_QUEUED,
  INTRO_AD_CAMPAIGN_STATUS_REJECTED,
  INTRO_AD_CTA_TYPE_PROFILE,
  INTRO_AD_CTA_TYPE_SELLER_PRODUCTS,
  INTRO_AD_DURATION_MS,
  INTRO_AD_PRICE_POINTS,
  INTRO_AD_NOTIFICATION_KIND_ACTIVATED,
  INTRO_AD_NOTIFICATION_KIND_APPROVED,
  INTRO_AD_NOTIFICATION_KIND_CANCELLED_BY_STAFF,
  INTRO_AD_NOTIFICATION_KIND_EXPIRED,
  INTRO_AD_NOTIFICATION_KIND_REJECTED,
} from "../../constants/introAdCampaignConstants.js";
import {
  AppIntroSettingsModel,
  IntroAdCampaignModel,
  ProductModel,
} from "../../models/index.js";
import { buildSellerCatalogProductsQuery } from "../user/userSellerCatalogProducts.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import { releaseLoyaltyPointsReservation } from "../loyalty/loyaltyPointsReserve.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

/**
 * @param {Record<string, unknown> | null | undefined} row
 */
export const toIntroAdCampaignPayload = (row) => ({
  _id: String(row._id),
  advertiserId: String(row.advertiserId),
  status: row.status,
  videoMp4Url: row.videoMp4Url ?? null,
  videoWebmUrl: row.videoWebmUrl ?? null,
  posterUrl: row.posterUrl ?? null,
  fallbackTitle: row.fallbackTitle ?? null,
  fallbackHint: row.fallbackHint ?? null,
  minMs: row.minMs ?? null,
  maxMs: row.maxMs ?? null,
  fadeOutMs: row.fadeOutMs ?? null,
  amountPoints: row.amountPoints ?? null,
  pointsReservedAt: row.pointsReservedAt ?? null,
  pointsChargedAt: row.pointsChargedAt ?? null,
  pointsReleasedAt: row.pointsReleasedAt ?? null,
  approvedByUserId: row.approvedByUserId ? String(row.approvedByUserId) : null,
  rejectedReason: row.rejectedReason ?? null,
  scheduledStartAt: row.scheduledStartAt ?? null,
  activatedAt: row.activatedAt ?? null,
  activeUntil: row.activeUntil ?? null,
  pausedAt: row.pausedAt ?? null,
  cancelledAt: row.cancelledAt ?? null,
  cancelledByUserId: row.cancelledByUserId ? String(row.cancelledByUserId) : null,
  ctaType: row.ctaType ?? null,
  createdAt: row.createdAt ?? null,
  updatedAt: row.updatedAt ?? null,
});

/**
 * @param {Record<string, unknown>} row
 */
export const toIntroAdPaidIntroPayload = (row, ctaType) => ({
  advertiserId: String(row.advertiserId),
  ctaType,
  videoMp4Url: row.videoMp4Url ?? null,
  videoWebmUrl: row.videoWebmUrl ?? null,
  posterUrl: row.posterUrl ?? null,
  fallbackTitle: row.fallbackTitle ?? null,
  fallbackHint: row.fallbackHint ?? null,
  minMs: row.minMs ?? null,
  maxMs: row.maxMs ?? null,
  fadeOutMs: row.fadeOutMs ?? null,
});

/**
 * @param {import('mongoose').Types.ObjectId | string} advertiserId
 */
export const resolveIntroAdCtaType = async (advertiserId) => {
  const count = await ProductModel.countDocuments(buildSellerCatalogProductsQuery(advertiserId));
  return count > 0 ? INTRO_AD_CTA_TYPE_SELLER_PRODUCTS : INTRO_AD_CTA_TYPE_PROFILE;
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} session
 */
export const findActiveIntroAdCampaign = async (session = null) => {
  const query = IntroAdCampaignModel.findOne({
    status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
  }).lean();
  if (session) {
    query.session(session);
  }
  return query;
};

/**
 * @param {Date} now
 */
const extendActiveUntilForPause = (campaign, now) => {
  if (!campaign.pausedAt) {
    return campaign.activeUntil;
  }
  const pauseMs = now.getTime() - new Date(campaign.pausedAt).getTime();
  if (pauseMs <= 0) {
    return campaign.activeUntil;
  }
  return new Date(new Date(campaign.activeUntil).getTime() + pauseMs);
};

/**
 * @param {import('mongoose').Types.ObjectId | string} campaignId
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 */
export const activateIntroAdCampaignRecord = async (campaignId, session = null) => {
  const now = new Date();
  const activeUntil = new Date(now.getTime() + INTRO_AD_DURATION_MS);

  const settings = await AppIntroSettingsModel.findOne({
    settingsKey: APP_INTRO_SETTINGS_KEY,
  })
    .select("prioritizePlatformIntro")
    .lean();

  const pausedAt = settings?.prioritizePlatformIntro === true ? now : null;

  const update = {
    status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
    activatedAt: now,
    activeUntil,
    scheduledStartAt: null,
    pausedAt,
  };

  const updated = await IntroAdCampaignModel.findOneAndUpdate(
    { _id: campaignId, status: INTRO_AD_CAMPAIGN_STATUS_QUEUED },
    { $set: update },
    withMongoSession({ returnDocument: "after" }, session),
  ).lean();

  if (updated) {
    await createUserInAppNotification({
      userId: updated.advertiserId,
      kind: INTRO_AD_NOTIFICATION_KIND_ACTIVATED,
      message: "Реклама в intro активирована на 3 дня",
    });
  }

  return updated;
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 */
export const activateNextQueuedIntroAdCampaign = async (session = null) => {
  const active = await findActiveIntroAdCampaign(session);
  if (active) {
    return null;
  }

  const now = new Date();
  const query = IntroAdCampaignModel.findOne({
    status: INTRO_AD_CAMPAIGN_STATUS_QUEUED,
    scheduledStartAt: { $lte: now },
  })
    .sort({ scheduledStartAt: 1, createdAt: 1 })
    .lean();

  if (session) {
    query.session(session);
  }

  const next = await query;
  if (!next) {
    return null;
  }

  return activateIntroAdCampaignRecord(next._id, session);
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 * @returns {Promise<boolean>}
 */
const expireNextDueActiveIntroAdCampaign = async (session = null) => {
  const now = new Date();

  const expired = await IntroAdCampaignModel.findOneAndUpdate(
    {
      status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
      pausedAt: null,
      activeUntil: { $lte: now },
    },
    { $set: { status: INTRO_AD_CAMPAIGN_STATUS_EXPIRED } },
    withMongoSession({ returnDocument: "after" }, session),
  ).lean();

  if (!expired) {
    return false;
  }

  await createUserInAppNotification({
    userId: expired.advertiserId,
    kind: INTRO_AD_NOTIFICATION_KIND_EXPIRED,
    message: "Срок рекламы в intro истёк",
  });

  return true;
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 * @returns {Promise<boolean>}
 */
const expireNextDuePausedIntroAdCampaign = async (session = null) => {
  const now = new Date();
  const pausedRows = await IntroAdCampaignModel.find({
    status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
    pausedAt: { $ne: null },
  }).lean();

  for (const row of pausedRows) {
    const effectiveUntil = extendActiveUntilForPause(row, now);
    if (!effectiveUntil || new Date(effectiveUntil) > now) {
      continue;
    }

    const expired = await IntroAdCampaignModel.findOneAndUpdate(
      {
        _id: row._id,
        status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
        pausedAt: { $ne: null },
      },
      { $set: { status: INTRO_AD_CAMPAIGN_STATUS_EXPIRED, pausedAt: null } },
      withMongoSession({ returnDocument: "after" }, session),
    ).lean();

    if (!expired) {
      continue;
    }

    await createUserInAppNotification({
      userId: expired.advertiserId,
      kind: INTRO_AD_NOTIFICATION_KIND_EXPIRED,
      message: "Срок рекламы в intro истёк",
    });

    return true;
  }

  return false;
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 */
export const expireIntroAdCampaignsAndActivateQueue = async (session = null) => {
  let anyExpired = false;

  while (await expireNextDueActiveIntroAdCampaign(session)) {
    anyExpired = true;
  }

  while (await expireNextDuePausedIntroAdCampaign(session)) {
    anyExpired = true;
  }

  if (anyExpired) {
    await activateNextQueuedIntroAdCampaign(session);
  }
};

export const processIntroAdCampaignCronTasks = async () => {
  try {
    await runInTransaction(async (session) => {
      await expireIntroAdCampaignsAndActivateQueue(session);

      const active = await findActiveIntroAdCampaign(session);
      if (!active) {
        await activateNextQueuedIntroAdCampaign(session);
      }
    });
  } catch (error) {
    console.error("processIntroAdCampaignCronTasks error:", error);
  }
};

export const pauseActiveIntroAdCampaignsForPlatformIntro = async () => {
  const now = new Date();
  const activeRows = await IntroAdCampaignModel.find({
    status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
    pausedAt: null,
  }).lean();

  for (const row of activeRows) {
    await IntroAdCampaignModel.updateOne(
      { _id: row._id },
      { $set: { pausedAt: now } },
    );
  }
};

export const resumePausedIntroAdCampaigns = async () => {
  const now = new Date();
  const pausedRows = await IntroAdCampaignModel.find({
    status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
    pausedAt: { $ne: null },
  }).lean();

  for (const row of pausedRows) {
    const activeUntil = extendActiveUntilForPause(row, now);
    await IntroAdCampaignModel.updateOne(
      { _id: row._id },
      { $set: { activeUntil, pausedAt: null } },
    );
  }
};

/**
 * @param {string} userId
 */
export const findOpenIntroAdCampaignForAdvertiser = async (userId) =>
  IntroAdCampaignModel.findOne({
    advertiserId: userId,
    status: { $in: INTRO_AD_CAMPAIGN_OPEN_STATUSES },
  })
    .sort({ createdAt: -1 })
    .lean();

/**
 * @param {string} userId
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 */
export const assertNoOpenIntroAdCampaignForAdvertiser = async (userId, session = null) => {
  const query = IntroAdCampaignModel.findOne({
    advertiserId: userId,
    status: { $in: INTRO_AD_CAMPAIGN_OPEN_STATUSES },
  }).lean();

  if (session) {
    query.session(session);
  }

  const existing = await query;
  if (existing) {
    throw new Error("INTRO_AD_CAMPAIGN_ALREADY_OPEN");
  }
};

/**
 * @param {import('mongoose').Types.ObjectId | string | null | undefined} prioritizePlatformIntro
 */
export const resolvePaidIntroForPublicPlayback = async (prioritizePlatformIntro) => {
  if (prioritizePlatformIntro === true) {
    return null;
  }

  await expireIntroAdCampaignsAndActivateQueue();

  const active = await IntroAdCampaignModel.findOne({
    status: INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
    pausedAt: null,
  }).lean();

  if (!active) {
    return null;
  }

  const ctaType =
    active.ctaType ?? (await resolveIntroAdCtaType(active.advertiserId));
  return toIntroAdPaidIntroPayload(active, ctaType);
};

export {
  INTRO_AD_NOTIFICATION_KIND_APPROVED,
  INTRO_AD_NOTIFICATION_KIND_REJECTED,
  INTRO_AD_NOTIFICATION_KIND_CANCELLED_BY_STAFF,
};

export const notifyIntroAdApproved = async (campaign) => {
  const isQueued = campaign.status === INTRO_AD_CAMPAIGN_STATUS_QUEUED;
  await createUserInAppNotification({
    userId: campaign.advertiserId,
    kind: INTRO_AD_NOTIFICATION_KIND_APPROVED,
    message: isQueued
      ? "Заявка на рекламу в intro одобрена и поставлена в очередь"
      : "Заявка на рекламу в intro одобрена и активирована",
  });
};

export const notifyIntroAdRejected = async (campaign, reason) => {
  await createUserInAppNotification({
    userId: campaign.advertiserId,
    kind: INTRO_AD_NOTIFICATION_KIND_REJECTED,
    message: reason
      ? `Заявка на рекламу в intro отклонена: ${reason}`
      : "Заявка на рекламу в intro отклонена",
  });
};

export const notifyIntroAdCancelledByStaff = async (campaign) => {
  await createUserInAppNotification({
    userId: campaign.advertiserId,
    kind: INTRO_AD_NOTIFICATION_KIND_CANCELLED_BY_STAFF,
    message: "Реклама в intro снята модератором",
  });
};

export const cancelIntroAdCampaignsForAdvertiser = async (advertiserId) => {
  const now = new Date();
  const openRows = await IntroAdCampaignModel.find({
    advertiserId,
    status: {
      $in: [
        INTRO_AD_CAMPAIGN_STATUS_PENDING,
        INTRO_AD_CAMPAIGN_STATUS_QUEUED,
        INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
      ],
    },
  }).lean();

  if (openRows.length === 0) {
    return;
  }

  let hadActive = false;

  await runInTransaction(async (session) => {
    for (const row of openRows) {
      const amount = Math.ceil(Number(row.amountPoints) || INTRO_AD_PRICE_POINTS);

      if (row.status === INTRO_AD_CAMPAIGN_STATUS_PENDING) {
        await releaseLoyaltyPointsReservation({
          userId: String(advertiserId),
          amount,
          session,
        });
      }

      if (row.status === INTRO_AD_CAMPAIGN_STATUS_ACTIVE) {
        hadActive = true;
      }

      await IntroAdCampaignModel.updateOne(
        { _id: row._id },
        {
          $set: {
            status: INTRO_AD_CAMPAIGN_STATUS_CANCELLED,
            cancelledAt: now,
            pointsReleasedAt:
              row.status === INTRO_AD_CAMPAIGN_STATUS_PENDING ? now : row.pointsReleasedAt,
          },
        },
        withMongoSession({}, session),
      );
    }

    if (hadActive) {
      await activateNextQueuedIntroAdCampaign(session);
    }
  });
};

export { INTRO_AD_CAMPAIGN_STATUS_PENDING, INTRO_AD_CAMPAIGN_STATUS_REJECTED };
