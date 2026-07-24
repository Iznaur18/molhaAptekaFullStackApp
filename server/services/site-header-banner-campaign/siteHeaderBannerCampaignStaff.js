import {
  SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_CANCELLED,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_REJECTED,
} from "../../constants/siteHeaderBannerCampaignConstants.js";
import { SiteHeaderBannerCampaignModel, UserModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import {
  activateSiteHeaderBannerCampaignRecord,
  assertSiteHeaderBannerCampaignSlotAvailable,
  notifySiteHeaderBannerCampaignApproved,
  notifySiteHeaderBannerCampaignCancelledByStaff,
  notifySiteHeaderBannerCampaignRejected,
  toSiteHeaderBannerCampaignPayload,
} from "./siteHeaderBannerCampaignHelpers.js";
import {
  chargeReservedLoyaltyPoints,
  releaseLoyaltyPointsReservation,
} from "../loyalty/loyaltyPointsReserve.js";
import { refundLoyaltyPoints } from "../loyalty/loyaltyPointsSpend.js";
import {
  creditReferralCashbackFromSpend,
  notifyReferralCashbackCredited,
} from "../referral/creditReferralCashbackFromSpend.js";
import { reverseReferralCashbackForSource } from "../referral/reverseReferralCashbackForSource.js";
import { REFERRAL_SOURCE_KIND_SITE_HEADER_BANNER } from "../../constants/referralConstants.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

const DEFAULT_MODERATION_LIMIT = 50;

export async function countPendingSiteHeaderBannerCampaigns() {
  const count = await SiteHeaderBannerCampaignModel.countDocuments({
    status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING,
  });

  return { count };
}

/**
 * @param {{ query: Record<string, unknown> }} input
 */
export async function getPendingSiteHeaderBannerCampaigns({ query }) {
  const limit = Math.min(
    DEFAULT_MODERATION_LIMIT,
    Math.max(1, Number(query.limit) || DEFAULT_MODERATION_LIMIT),
  );

  const rows = await SiteHeaderBannerCampaignModel.find({
    status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING,
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  const advertiserIds = [...new Set(rows.map((row) => String(row.advertiserId)))];
  const advertisers = await UserModel.find({ _id: { $in: advertiserIds } })
    .select("userName userSurname userNickname userProfilePhotoUrl")
    .lean();
  const advertiserById = new Map(advertisers.map((row) => [String(row._id), row]));

  return {
    campaigns: rows.map((row) => ({
      ...toSiteHeaderBannerCampaignPayload(row),
      advertiser: advertiserById.get(String(row.advertiserId)) ?? null,
    })),
  };
}

export async function getManagedSiteHeaderBannerCampaigns() {
  const rows = await SiteHeaderBannerCampaignModel.find({
    status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
  })
    .sort({ activatedAt: 1, createdAt: 1 })
    .lean();

  const advertiserIds = [...new Set(rows.map((row) => String(row.advertiserId)))];
  const advertisers = await UserModel.find({ _id: { $in: advertiserIds } })
    .select("userName userSurname userNickname userProfilePhotoUrl")
    .lean();
  const advertiserById = new Map(advertisers.map((row) => [String(row._id), row]));

  return {
    campaigns: rows.map((row) => ({
      ...toSiteHeaderBannerCampaignPayload(row),
      advertiser: advertiserById.get(String(row.advertiserId)) ?? null,
    })),
  };
}

/**
 * @param {{
 *   staffUserId: string;
 *   campaignId: string;
 * }} input
 */
export async function approveSiteHeaderBannerCampaign({ staffUserId, campaignId }) {
  const campaign = await SiteHeaderBannerCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (campaign.status !== SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING) {
    throw new AppError(409, "Заявка уже обработана");
  }

  const amount = Math.ceil(
    Number(campaign.amountPoints) || SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
  );

  try {
    const { saved, cashback } = await runInTransaction(async (session) => {
      await assertSiteHeaderBannerCampaignSlotAvailable(session);

      const fresh = await SiteHeaderBannerCampaignModel.findById(campaignId).session(session);
      if (!fresh || fresh.status !== SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING) {
        throw new AppError(409, "Заявка уже обработана");
      }

      await chargeReservedLoyaltyPoints({
        userId: String(fresh.advertiserId),
        amount,
        session,
      });

      const cashback = await creditReferralCashbackFromSpend({
        spenderUserId: String(fresh.advertiserId),
        pointsSpent: amount,
        sourceKind: REFERRAL_SOURCE_KIND_SITE_HEADER_BANNER,
        sourceId: String(fresh._id),
        session,
      });

      const now = new Date();
      fresh.pointsChargedAt = now;
      fresh.approvedByUserId = staffUserId;
      await fresh.save(withMongoSession({}, session));

      const activated = await activateSiteHeaderBannerCampaignRecord(fresh._id, session);
      return { saved: activated, cashback };
    });

    if (cashback?.deferNotification) {
      await notifyReferralCashbackCredited({
        referrerUserId: cashback.referrerUserId,
        amount: cashback.amount,
        spenderUserId: String(campaign.advertiserId),
      });
    }

    if (saved) {
      await notifySiteHeaderBannerCampaignApproved(saved);
    }

    return {
      message: "Заявка одобрена",
      campaign: saved ? toSiteHeaderBannerCampaignPayload(saved) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "SITE_HEADER_BANNER_CAMPAIGN_SLOTS_FULL") {
      throw new AppError(409, "Все платные слоты заняты. Попробуйте позже.");
    }
    throw error;
  }
}

/**
 * @param {{
 *   campaignId: string;
 *   reason?: string | null;
 * }} input
 */
export async function rejectSiteHeaderBannerCampaign({ campaignId, reason }) {
  const campaign = await SiteHeaderBannerCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (campaign.status !== SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING) {
    throw new AppError(409, "Заявка уже обработана");
  }

  const now = new Date();
  const amount = Math.ceil(
    Number(campaign.amountPoints) || SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
  );
  const trimmedReason = String(reason ?? "").trim() || null;

  await runInTransaction(async (session) => {
    await releaseLoyaltyPointsReservation({
      userId: String(campaign.advertiserId),
      amount,
      session,
    });

    await SiteHeaderBannerCampaignModel.updateOne(
      { _id: campaign._id },
      {
        $set: {
          status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_REJECTED,
          rejectedReason: trimmedReason,
          pointsReleasedAt: now,
        },
      },
      withMongoSession({}, session),
    );
  });

  await notifySiteHeaderBannerCampaignRejected(campaign, trimmedReason);

  return { message: "Заявка отклонена" };
}

/**
 * @param {{
 *   staffUserId: string;
 *   campaignId: string;
 * }} input
 */
export async function cancelSiteHeaderBannerCampaignByStaff({ staffUserId, campaignId }) {
  const campaign = await SiteHeaderBannerCampaignModel.findById(campaignId).lean();
  if (!campaign) {
    throw new AppError(404, "Заявка не найдена");
  }
  if (campaign.status !== SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE) {
    throw new AppError(409, "Можно снять только активный баннер");
  }

  const now = new Date();
  const amount = Math.ceil(
    Number(campaign.amountPoints) || SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS,
  );

  await runInTransaction(async (session) => {
    if (campaign.pointsChargedAt) {
      await refundLoyaltyPoints({
        userId: String(campaign.advertiserId),
        amount,
        session,
      });
      await reverseReferralCashbackForSource({
        sourceKind: REFERRAL_SOURCE_KIND_SITE_HEADER_BANNER,
        sourceId: String(campaign._id),
        session,
      });
    }

    await SiteHeaderBannerCampaignModel.updateOne(
      { _id: campaign._id },
      {
        $set: {
          status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_CANCELLED,
          cancelledAt: now,
          cancelledByUserId: staffUserId,
          pointsReleasedAt: now,
        },
      },
      withMongoSession({}, session),
    );
  });

  await notifySiteHeaderBannerCampaignCancelledByStaff(campaign);

  return { message: "Баннер снят" };
}
