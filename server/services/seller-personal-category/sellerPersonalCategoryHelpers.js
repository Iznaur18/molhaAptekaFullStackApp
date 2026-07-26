import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_ACTIVATED,
  SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_EXPIRED,
  SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_REJECTED,
  SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_REMINDER_1_DAY,
  SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_REMINDER_1_HOUR,
  SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_CANCELLED_BY_STAFF,
  SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_DELETED_BY_STAFF,
  SELLER_PERSONAL_CATEGORY_OPEN_STATUSES,
  SELLER_PERSONAL_CATEGORY_REMINDER_1_DAY_MS,
  SELLER_PERSONAL_CATEGORY_REMINDER_1_HOUR_MS,
  SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
  SELLER_PERSONAL_CATEGORY_STATUS_EXPIRED,
  SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
} from "../../constants/sellerPersonalCategoryConstants.js";
import {
  ProductModel,
  SellerPersonalCategoryCampaignModel,
  SellerPersonalCategoryModel,
} from "../../models/index.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

/**
 * @param {Record<string, unknown> | null | undefined} row
 */
export const toSellerPersonalCategoryCampaignPayload = (row) => ({
  _id: String(row?._id),
  sellerId: String(row?.sellerId),
  personalCategoryId: row?.personalCategoryId ? String(row.personalCategoryId) : null,
  status: row?.status,
  labelRu: row?.labelRu ?? null,
  imageUrl: row?.imageUrl ?? null,
  tariffCode: row?.tariffCode ?? null,
  regionCode: row?.regionCode ?? null,
  durationHours: row?.durationHours ?? null,
  amountPoints: row?.amountPoints ?? null,
  pointsReservedAt: row?.pointsReservedAt ?? null,
  pointsChargedAt: row?.pointsChargedAt ?? null,
  pointsReleasedAt: row?.pointsReleasedAt ?? null,
  approvedByUserId: row?.approvedByUserId ? String(row.approvedByUserId) : null,
  rejectedReason: row?.rejectedReason ?? null,
  activatedAt: row?.activatedAt ?? null,
  activeUntil: row?.activeUntil ?? null,
  reminderSentAt1Day: row?.reminderSentAt1Day ?? null,
  reminderSentAt1Hour: row?.reminderSentAt1Hour ?? null,
  cancelledAt: row?.cancelledAt ?? null,
  cancelledByUserId: row?.cancelledByUserId ? String(row.cancelledByUserId) : null,
  createdAt: row?.createdAt ?? null,
  updatedAt: row?.updatedAt ?? null,
});

/**
 * @param {Record<string, unknown> | null | undefined} row
 */
export const toSellerPersonalCategoryTilePayload = (row) => ({
  _id: String(row?._id),
  sellerId: String(row?.sellerId),
  labelRu: row?.labelRu ?? "",
  imageUrl: row?.imageUrl ?? null,
  regionCode: row?.regionCode ?? null,
  activeUntil: row?.activeUntil ?? null,
});

/**
 * @param {string} sellerId
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 */
export const assertNoOpenSellerPersonalCategoryCampaign = async (sellerId, session = null) => {
  const query = SellerPersonalCategoryCampaignModel.findOne({
    sellerId,
    status: { $in: SELLER_PERSONAL_CATEGORY_OPEN_STATUSES },
  }).lean();

  if (session) {
    query.session(session);
  }

  const existing = await query;
  if (existing) {
    throw new Error("SELLER_PERSONAL_CATEGORY_CAMPAIGN_ALREADY_OPEN");
  }
};

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerId
 * @param {import('mongoose').Types.ObjectId | string} personalCategoryId
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 */
export const linkSellerProductsToPersonalCategory = async (
  sellerId,
  personalCategoryId,
  session = null,
) => {
  await ProductModel.updateMany(
    {
      productSeller: sellerId,
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
    },
    { $set: { sellerPersonalCategoryId: personalCategoryId } },
    withMongoSession({}, session),
  );
};

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerId
 * @param {import('mongoose').Types.ObjectId | string} personalCategoryId
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 */
export const unlinkSellerProductsFromPersonalCategory = async (
  sellerId,
  personalCategoryId,
  session = null,
) => {
  await ProductModel.updateMany(
    {
      productSeller: sellerId,
      sellerPersonalCategoryId: personalCategoryId,
    },
    { $set: { sellerPersonalCategoryId: null } },
    withMongoSession({}, session),
  );
};

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerId
 */
export const resolveActiveSellerPersonalCategoryId = async (sellerId) => {
  const now = new Date();
  const category = await SellerPersonalCategoryModel.findOne({
    sellerId,
    activeUntil: { $gt: now },
  })
    .select("_id")
    .lean();

  return category?._id ?? null;
};

/**
 * @param {{
 *   campaignId: import('mongoose').Types.ObjectId | string;
 *   approvedByUserId: import('mongoose').Types.ObjectId | string;
 *   session?: import('mongoose').ClientSession | null;
 * }} params
 */
export const activateSellerPersonalCategoryCampaign = async ({
  campaignId,
  approvedByUserId,
  session = null,
}) => {
  const campaignQuery = SellerPersonalCategoryCampaignModel.findById(campaignId);
  if (session) {
    campaignQuery.session(session);
  }
  const campaign = await campaignQuery;
  if (!campaign || campaign.status !== SELLER_PERSONAL_CATEGORY_STATUS_PENDING) {
    throw new Error("SELLER_PERSONAL_CATEGORY_CAMPAIGN_NOT_PENDING");
  }

  const now = new Date();
  const activeUntil = new Date(now.getTime() + campaign.durationHours * 60 * 60 * 1000);

  const category = await SellerPersonalCategoryModel.findOneAndUpdate(
    { sellerId: campaign.sellerId },
    {
      $set: {
        sellerId: campaign.sellerId,
        labelRu: campaign.labelRu,
        imageUrl: campaign.imageUrl,
        regionCode: campaign.regionCode,
        activeUntil,
        activeCampaignId: campaign._id,
      },
    },
    withMongoSession({ upsert: true, returnDocument: "after", runValidators: true }, session),
  ).lean();

  campaign.personalCategoryId = category._id;
  campaign.status = SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE;
  campaign.approvedByUserId = approvedByUserId;
  campaign.activatedAt = now;
  campaign.activeUntil = activeUntil;
  campaign.reminderSentAt1Day = null;
  campaign.reminderSentAt1Hour = null;
  await campaign.save(withMongoSession({}, session));

  await linkSellerProductsToPersonalCategory(
    campaign.sellerId,
    category._id,
    session,
  );

  return campaign.toObject();
};

/**
 * @param {Record<string, unknown>} campaign
 */
export const notifySellerPersonalCategoryApproved = async (campaign) => {
  await createUserInAppNotification({
    userId: campaign.sellerId,
    kind: SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_ACTIVATED,
    message: `Личная категория «${campaign.labelRu}» одобрена и опубликована в каталоге`,
  });
};

/**
 * @param {Record<string, unknown>} campaign
 * @param {string | null} reason
 */
export const notifySellerPersonalCategoryRejected = async (campaign, reason) => {
  const suffix = reason ? `: ${reason}` : "";
  await createUserInAppNotification({
    userId: campaign.sellerId,
    kind: SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_REJECTED,
    message: `Заявка на личную категорию отклонена${suffix}`,
  });
};

/**
 * @param {Record<string, unknown>} campaign
 */
export const notifySellerPersonalCategoryExpired = async (campaign) => {
  await createUserInAppNotification({
    userId: campaign.sellerId,
    kind: SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_EXPIRED,
    message: `Срок личной категории «${campaign.labelRu}» истёк`,
  });
};

/**
 * @param {Record<string, unknown>} campaign
 */
export const notifySellerPersonalCategoryCancelledByStaff = async (campaign) => {
  await createUserInAppNotification({
    userId: campaign.sellerId,
    kind: SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_CANCELLED_BY_STAFF,
    message: `Личная категория «${campaign.labelRu}» снята модератором с публикации`,
  });
};

/**
 * @param {Record<string, unknown>} campaign
 */
export const notifySellerPersonalCategoryDeletedByStaff = async (campaign) => {
  await createUserInAppNotification({
    userId: campaign.sellerId,
    kind: SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_DELETED_BY_STAFF,
    message: `Личная категория «${campaign.labelRu}» удалена модератором`,
  });
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 * @returns {Promise<boolean>}
 */
const expireNextDueActiveSellerPersonalCategoryCampaign = async (session = null) => {
  const now = new Date();
  const expired = await SellerPersonalCategoryCampaignModel.findOneAndUpdate(
    {
      status: SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
      activeUntil: { $lte: now },
    },
    { $set: { status: SELLER_PERSONAL_CATEGORY_STATUS_EXPIRED } },
    withMongoSession({ returnDocument: "after" }, session),
  ).lean();

  if (!expired) {
    return false;
  }

  if (expired.personalCategoryId) {
    await SellerPersonalCategoryModel.updateOne(
      { _id: expired.personalCategoryId },
      { $set: { activeUntil: null, activeCampaignId: null } },
      withMongoSession({}, session),
    );

    await unlinkSellerProductsFromPersonalCategory(
      expired.sellerId,
      expired.personalCategoryId,
      session,
    );
  }

  await notifySellerPersonalCategoryExpired(expired);
  return true;
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 */
export const expireDueActiveSellerPersonalCategoryCampaigns = async (session = null) => {
  while (await expireNextDueActiveSellerPersonalCategoryCampaign(session)) {
    // drain all due campaigns
  }
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} [session]
 */
const sendSellerPersonalCategoryReminders = async (session = null) => {
  const now = new Date();
  const oneDayThreshold = new Date(now.getTime() + SELLER_PERSONAL_CATEGORY_REMINDER_1_DAY_MS);
  const oneHourThreshold = new Date(now.getTime() + SELLER_PERSONAL_CATEGORY_REMINDER_1_HOUR_MS);

  const dayCandidates = await SellerPersonalCategoryCampaignModel.find({
    status: SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
    activeUntil: { $gt: now, $lte: oneDayThreshold },
    reminderSentAt1Day: null,
  })
    .select("_id sellerId labelRu activeUntil")
    .lean();

  if (dayCandidates.length > 0) {
    const ids = dayCandidates.map((row) => row._id);
    await SellerPersonalCategoryCampaignModel.updateMany(
      { _id: { $in: ids }, reminderSentAt1Day: null },
      { $set: { reminderSentAt1Day: now } },
      withMongoSession({}, session),
    );

    for (const row of dayCandidates) {
      await createUserInAppNotification({
        userId: row.sellerId,
        kind: SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_REMINDER_1_DAY,
        message: `Личная категория «${row.labelRu}» истекает через 1 день`,
      });
    }
  }

  const hourCandidates = await SellerPersonalCategoryCampaignModel.find({
    status: SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
    activeUntil: { $gt: now, $lte: oneHourThreshold },
    reminderSentAt1Hour: null,
  })
    .select("_id sellerId labelRu activeUntil")
    .lean();

  if (hourCandidates.length > 0) {
    const ids = hourCandidates.map((row) => row._id);
    await SellerPersonalCategoryCampaignModel.updateMany(
      { _id: { $in: ids }, reminderSentAt1Hour: null },
      { $set: { reminderSentAt1Hour: now } },
      withMongoSession({}, session),
    );

    for (const row of hourCandidates) {
      await createUserInAppNotification({
        userId: row.sellerId,
        kind: SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_REMINDER_1_HOUR,
        message: `Личная категория «${row.labelRu}» истекает через 1 час`,
      });
    }
  }
};

export const processSellerPersonalCategoryCronTasks = async () => {
  try {
    await runInTransaction(async (session) => {
      await expireDueActiveSellerPersonalCategoryCampaigns(session);
    });
    await sendSellerPersonalCategoryReminders();
  } catch (error) {
    console.error("processSellerPersonalCategoryCronTasks error:", error);
  }
};
