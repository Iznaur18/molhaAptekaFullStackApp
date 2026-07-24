import {
  SITE_HEADER_BANNER_CAMPAIGN_DURATION_MS,
  SITE_HEADER_BANNER_CAMPAIGN_PAID_SLOT_LIMIT,
  SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_CANCELLED,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_EXPIRED,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING,
  SITE_HEADER_BANNER_CAMPAIGN_NOTIFICATION_KIND_APPROVED,
  SITE_HEADER_BANNER_CAMPAIGN_NOTIFICATION_KIND_CANCELLED_BY_STAFF,
  SITE_HEADER_BANNER_CAMPAIGN_NOTIFICATION_KIND_EXPIRED,
  SITE_HEADER_BANNER_CAMPAIGN_NOTIFICATION_KIND_REJECTED,
} from "../../constants/siteHeaderBannerCampaignConstants.js";
import { SiteHeaderBannerCampaignModel } from "../../models/SiteHeaderBannerCampaignModel.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import {
  releaseLoyaltyPointsReservation,
} from "../loyalty/loyaltyPointsReserve.js";
import { refundLoyaltyPoints } from "../loyalty/loyaltyPointsSpend.js";
import { reverseReferralCashbackForSource } from "../referral/reverseReferralCashbackForSource.js";
import { REFERRAL_SOURCE_KIND_SITE_HEADER_BANNER } from "../../constants/referralConstants.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

/**
 * @param {unknown} value
 * @returns {string | null}
 */
const toIsoDateString = (value) => {
  if (value == null) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * @param {import('mongoose').LeanDocument<any>} row
 */
export const toSiteHeaderBannerCampaignPayload = (row) => ({
  _id: String(row._id),
  advertiserId: String(row.advertiserId),
  status: String(row.status),
  imageUrl: String(row.imageUrl ?? ""),
  imageAlt: String(row.imageAlt ?? ""),
  linkPath: row.linkPath == null ? null : String(row.linkPath),
  backgroundColor: row.backgroundColor == null ? null : String(row.backgroundColor),
  amountPoints: Math.ceil(Number(row.amountPoints) || SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS),
  pointsReservedAt: toIsoDateString(row.pointsReservedAt),
  pointsChargedAt: toIsoDateString(row.pointsChargedAt),
  pointsReleasedAt: toIsoDateString(row.pointsReleasedAt),
  approvedByUserId: row.approvedByUserId ? String(row.approvedByUserId) : null,
  rejectedReason: row.rejectedReason ?? null,
  activatedAt: toIsoDateString(row.activatedAt),
  activeUntil: toIsoDateString(row.activeUntil),
  cancelledAt: toIsoDateString(row.cancelledAt),
  cancelledByUserId: row.cancelledByUserId ? String(row.cancelledByUserId) : null,
  createdAt: toIsoDateString(row.createdAt),
  updatedAt: toIsoDateString(row.updatedAt),
});

/**
 * @param {import('mongoose').ClientSession | null | undefined} session
 */
export const countActiveSiteHeaderBannerCampaignSlots = async (session = null) => {
  const now = new Date();
  const query = SiteHeaderBannerCampaignModel.countDocuments({
    status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
    activeUntil: { $gt: now },
  });
  if (session) {
    query.session(session);
  }
  return query;
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} session
 */
export const assertSiteHeaderBannerCampaignSlotAvailable = async (session = null) => {
  const activeCount = await countActiveSiteHeaderBannerCampaignSlots(session);
  if (activeCount >= SITE_HEADER_BANNER_CAMPAIGN_PAID_SLOT_LIMIT) {
    throw new Error("SITE_HEADER_BANNER_CAMPAIGN_SLOTS_FULL");
  }
};

/**
 * @param {string} advertiserId
 * @param {import('mongoose').ClientSession | null | undefined} session
 */
export const assertNoOpenSiteHeaderBannerCampaignForAdvertiser = async (
  advertiserId,
  session = null,
) => {
  const existing = await SiteHeaderBannerCampaignModel.findOne({
    advertiserId,
    status: {
      $in: [SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING, SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE],
    },
  })
    .select("_id")
    .session(session ?? null)
    .lean();

  if (existing) {
    throw new Error("SITE_HEADER_BANNER_CAMPAIGN_ALREADY_OPEN");
  }
};

/**
 * @param {import('mongoose').Types.ObjectId | string} campaignId
 * @param {import('mongoose').ClientSession | null | undefined} session
 */
export const activateSiteHeaderBannerCampaignRecord = async (campaignId, session = null) => {
  const now = new Date();
  const activeUntil = new Date(now.getTime() + SITE_HEADER_BANNER_CAMPAIGN_DURATION_MS);

  const campaign = await SiteHeaderBannerCampaignModel.findByIdAndUpdate(
    campaignId,
    {
      $set: {
        status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
        activatedAt: now,
        activeUntil,
      },
    },
    { new: true, ...((session && { session }) || {}) },
  ).lean();

  return campaign;
};

export const getSiteHeaderBannerCampaignConfigPayload = async () => {
  const activePaidSlots = await countActiveSiteHeaderBannerCampaignSlots();

  return {
    pricePoints: SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
    durationDays: SITE_HEADER_BANNER_CAMPAIGN_DURATION_MS / (24 * 60 * 60 * 1000),
    paidSlotLimit: SITE_HEADER_BANNER_CAMPAIGN_PAID_SLOT_LIMIT,
    activePaidSlots,
  };
};

/**
 * @param {import('mongoose').LeanDocument<any>} campaign
 */
export const notifySiteHeaderBannerCampaignApproved = async (campaign) => {
  await createUserInAppNotification({
    userId: campaign.advertiserId,
    kind: SITE_HEADER_BANNER_CAMPAIGN_NOTIFICATION_KIND_APPROVED,
    message: "Заявка на баннер в шапке одобрена и показывается на главной",
  });
};

/**
 * @param {import('mongoose').LeanDocument<any>} campaign
 * @param {string | null | undefined} reason
 */
export const notifySiteHeaderBannerCampaignRejected = async (campaign, reason) => {
  await createUserInAppNotification({
    userId: campaign.advertiserId,
    kind: SITE_HEADER_BANNER_CAMPAIGN_NOTIFICATION_KIND_REJECTED,
    message: reason
      ? `Заявка на баннер в шапке отклонена: ${reason}`
      : "Заявка на баннер в шапке отклонена",
  });
};

/**
 * @param {import('mongoose').LeanDocument<any>} campaign
 */
export const notifySiteHeaderBannerCampaignExpired = async (campaign) => {
  await createUserInAppNotification({
    userId: campaign.advertiserId,
    kind: SITE_HEADER_BANNER_CAMPAIGN_NOTIFICATION_KIND_EXPIRED,
    message: "Показ баннера в шапке завершён",
  });
};

/**
 * @param {import('mongoose').LeanDocument<any>} campaign
 */
export const notifySiteHeaderBannerCampaignCancelledByStaff = async (campaign) => {
  await createUserInAppNotification({
    userId: campaign.advertiserId,
    kind: SITE_HEADER_BANNER_CAMPAIGN_NOTIFICATION_KIND_CANCELLED_BY_STAFF,
    message: "Баннер в шапке снят модератором",
  });
};

export const expireSiteHeaderBannerCampaigns = async (session = null) => {
  const now = new Date();
  const expiredRows = await SiteHeaderBannerCampaignModel.find({
    status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
    activeUntil: { $lte: now },
  })
    .session(session ?? null)
    .lean();

  if (expiredRows.length === 0) {
    return { expiredCount: 0 };
  }

  await SiteHeaderBannerCampaignModel.updateMany(
    {
      _id: { $in: expiredRows.map((row) => row._id) },
    },
    {
      $set: {
        status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_EXPIRED,
      },
    },
    session ? { session } : {},
  );

  for (const row of expiredRows) {
    await notifySiteHeaderBannerCampaignExpired(row);
  }

  return { expiredCount: expiredRows.length };
};

export const processSiteHeaderBannerCampaignCronTasks = async () => {
  await expireSiteHeaderBannerCampaigns();
};

export const cancelSiteHeaderBannerCampaignsForAdvertiser = async (advertiserId) => {
  const openRows = await SiteHeaderBannerCampaignModel.find({
    advertiserId,
    status: {
      $in: [
        SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING,
        SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
      ],
    },
  }).lean();

  if (openRows.length === 0) {
    return;
  }

  const now = new Date();

  await runInTransaction(async (session) => {
    for (const row of openRows) {
      const amount = Math.ceil(
        Number(row.amountPoints) || SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
      );

      if (row.status === SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING) {
        await releaseLoyaltyPointsReservation({
          userId: String(advertiserId),
          amount,
          session,
        });
      }

      if (row.status === SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE && row.pointsChargedAt) {
        await refundLoyaltyPoints({
          userId: String(advertiserId),
          amount,
          session,
        });
        await reverseReferralCashbackForSource({
          sourceKind: REFERRAL_SOURCE_KIND_SITE_HEADER_BANNER,
          sourceId: String(row._id),
          session,
        });
      }

      await SiteHeaderBannerCampaignModel.updateOne(
        { _id: row._id },
        {
          $set: {
            status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_CANCELLED,
            cancelledAt: now,
            cancelledByUserId: advertiserId,
            pointsReleasedAt: now,
          },
        },
        withMongoSession({}, session),
      );
    }
  });
};
