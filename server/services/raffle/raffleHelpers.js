import mongoose from "mongoose";

import { ORDER_STATUS_CONFIRMED } from "../../constants/orderConstants.js";
import {
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_COMPLETED,
  RAFFLE_STATUS_PAUSED,
  SITE_RAFFLES_ACTIVE_VITRINE_MAX,
  SITE_RAFFLES_COMPLETED_VITRINE_MAX,
} from "../../constants/raffleConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { OrderModel, ProductModel, RaffleModel, UserModel } from "../../models/index.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import { notifyFollowersOfSellerRaffleCompleted } from "../user/userFollowHelpers.js";
import { normalizeRafflePrizeImageFocus } from "../user/profileImageFocus.js";
import {
  applyRafflePrizeMediaFields,
  normalizePrizeMediaType,
} from "./rafflePrizeMedia.js";
import { pickWeightedRaffleWinnerUserId } from "./pickWeightedRaffleWinner.js";
import { getCompletedRaffleExpiryCutoff } from "./getCompletedRaffleExpiryCutoff.js";

const RAFFLE_SALE_COUNT_ITEM_STATUSES = [ORDER_STATUS_CONFIRMED];
const WINNER_FALLBACK_USER_NAME = "Пользователь";

export { getCompletedRaffleExpiryCutoff };

export const RAFFLE_NOTIFICATION_KIND_GOAL_REACHED = "raffle_goal_reached";
export const RAFFLE_NOTIFICATION_KIND_COMPLETED = "raffle_completed";
export const RAFFLE_NOTIFICATION_KIND_WINNER = "raffle_winner";

/**
 * @param {Array<{ productId: import('mongoose').Types.ObjectId | string; participationStartAt: Date }>} productWindows
 * @returns {Promise<{ soldQuantity: number; participantsCount: number }>}
 */
const countRaffleSalesAndParticipants = async (productWindows) => {
  if (!Array.isArray(productWindows) || productWindows.length === 0) {
    return { soldQuantity: 0, participantsCount: 0 };
  }

  const orClauses = productWindows.map(({ productId, participationStartAt }) => ({
    $and: [
      { "items.productId": new mongoose.Types.ObjectId(String(productId)) },
      { "items.status": { $in: RAFFLE_SALE_COUNT_ITEM_STATUSES } },
      { "items.confirmedAt": { $ne: null, $gte: participationStartAt } },
    ],
  }));

  const rows = await OrderModel.aggregate([
    { $unwind: "$items" },
    { $match: { $or: orClauses } },
    {
      $group: {
        _id: null,
        soldQuantity: { $sum: "$items.quantity" },
        buyerIds: { $addToSet: "$userBuyerId" },
      },
    },
    {
      $project: {
        soldQuantity: 1,
        participantsCount: { $size: "$buyerIds" },
      },
    },
  ]);

  return {
    soldQuantity: Number(rows[0]?.soldQuantity) || 0,
    participantsCount: Number(rows[0]?.participantsCount) || 0,
  };
};

/**
 * @param {Array<{ productId: import('mongoose').Types.ObjectId | string; participationStartAt: Date }>} productWindows
 * @returns {Promise<Array<{ userId: string; ticketCount: number }>>}
 */
export const listRaffleBuyerTicketCounts = async (productWindows) => {
  if (!Array.isArray(productWindows) || productWindows.length === 0) {
    return [];
  }

  const orClauses = productWindows.map(({ productId, participationStartAt }) => ({
    $and: [
      { "items.productId": new mongoose.Types.ObjectId(String(productId)) },
      { "items.status": { $in: RAFFLE_SALE_COUNT_ITEM_STATUSES } },
      { "items.confirmedAt": { $ne: null, $gte: participationStartAt } },
    ],
  }));

  const rows = await OrderModel.aggregate([
    { $unwind: "$items" },
    { $match: { $or: orClauses } },
    {
      $group: {
        _id: "$userBuyerId",
        ticketCount: { $sum: "$items.quantity" },
      },
    },
  ]);

  return rows
    .map((row) => ({
      userId: row._id != null ? String(row._id) : "",
      ticketCount: Math.max(0, Math.floor(Number(row.ticketCount) || 0)),
    }))
    .filter((row) => row.userId.length > 0 && row.ticketCount > 0);
};

/**
 * @param {string | null} winnerUserId
 * @returns {Promise<{ winnerUserId: string | null; winnerUserName: string; winnerUserAvatarUrl: string; winnerSelectedAt: Date | null }>}
 */
const resolveRaffleWinnerSnapshot = async (winnerUserId) => {
  if (!winnerUserId) {
    return {
      winnerUserId: null,
      winnerUserName: "",
      winnerUserAvatarUrl: "",
      winnerSelectedAt: null,
    };
  }

  const user = await UserModel.findById(winnerUserId)
    .select("userName userAvatarUrl")
    .lean();

  return {
    winnerUserId: String(winnerUserId),
    winnerUserName:
      typeof user?.userName === "string" && user.userName.trim()
        ? user.userName.trim()
        : WINNER_FALLBACK_USER_NAME,
    winnerUserAvatarUrl:
      typeof user?.userAvatarUrl === "string" ? user.userAvatarUrl.trim() : "",
    winnerSelectedAt: new Date(),
  };
};

/**
 * @param {Record<string, unknown>} raffle
 * @returns {Promise<Array<{ productId: import('mongoose').Types.ObjectId; participationStartAt: Date }>>}
 */
const buildRaffleProductSaleWindows = async (raffle) => {
  const activatedAt = raffle.approvedAt;
  if (!activatedAt) {
    return [];
  }

  const products = await ProductModel.find({
    activeRaffleId: raffle._id,
    raffleParticipationEnabledAt: { $ne: null },
  })
    .select("_id raffleParticipationEnabledAt")
    .lean();

  return products.map((product) => ({
    productId: product._id,
    participationStartAt: new Date(
      Math.max(
        new Date(activatedAt).getTime(),
        new Date(product.raffleParticipationEnabledAt).getTime(),
      ),
    ),
  }));
};

/**
 * @param {import('mongoose').Types.ObjectId | string} raffleId
 */
export const recalculateRaffleSalesProgress = async (raffleId) => {
  const raffle = await RaffleModel.findById(raffleId).lean();
  if (!raffle || raffle.status !== RAFFLE_STATUS_ACTIVE) {
    return raffle;
  }

  const productWindows = await buildRaffleProductSaleWindows(raffle);
  const { soldQuantity: salesProgress, participantsCount } =
    await countRaffleSalesAndParticipants(productWindows);

  const targetSales = Number(raffle.targetSales) || 0;

  if (salesProgress >= targetSales && targetSales > 0) {
    await completeRaffleById(raffleId, salesProgress, participantsCount);
    return RaffleModel.findById(raffleId).lean();
  }

  await RaffleModel.updateOne(
    { _id: raffleId },
    { $set: { salesProgress, participantsCount } },
  );

  return RaffleModel.findById(raffleId).lean();
};

/**
 * @param {import('mongoose').Types.ObjectId | string} raffleId
 * @param {number} [salesProgress]
 * @param {number} [participantsCount]
 */
export const completeRaffleById = async (raffleId, salesProgress, participantsCount) => {
  const raffle = await RaffleModel.findById(raffleId).lean();
  if (!raffle || raffle.status === RAFFLE_STATUS_COMPLETED) {
    return raffle;
  }

  const progress =
    salesProgress != null ? salesProgress : Number(raffle.salesProgress) || 0;
  const participants =
    participantsCount != null
      ? participantsCount
      : Number(raffle.participantsCount) || 0;

  const productWindows = await buildRaffleProductSaleWindows(raffle);
  const ticketEntries = await listRaffleBuyerTicketCounts(productWindows);
  const winnerUserId = pickWeightedRaffleWinnerUserId(ticketEntries);
  const winnerSnapshot = await resolveRaffleWinnerSnapshot(winnerUserId);

  const completed = await RaffleModel.findOneAndUpdate(
    {
      _id: raffleId,
      status: { $ne: RAFFLE_STATUS_COMPLETED },
    },
    {
      $set: {
        status: RAFFLE_STATUS_COMPLETED,
        salesProgress: progress,
        participantsCount: participants,
        completedAt: new Date(),
        winnerUserId: winnerSnapshot.winnerUserId,
        winnerUserName: winnerSnapshot.winnerUserName,
        winnerUserAvatarUrl: winnerSnapshot.winnerUserAvatarUrl,
        winnerSelectedAt: winnerSnapshot.winnerSelectedAt,
      },
    },
    { new: true },
  ).lean();

  if (!completed) {
    return RaffleModel.findById(raffleId).lean();
  }

  await clearRaffleParticipationFromProducts(raffleId);

  try {
    const winnerLabel = winnerSnapshot.winnerUserName || WINNER_FALLBACK_USER_NAME;
    const sellerMessage = winnerSnapshot.winnerUserId
      ? `Розыгрыш «${raffle.title}» завершён. Победитель: ${winnerLabel}`
      : `Розыгрыш «${raffle.title}» завершён`;

    await createUserInAppNotification({
      userId: raffle.sellerId,
      kind: RAFFLE_NOTIFICATION_KIND_GOAL_REACHED,
      message: sellerMessage,
    });

    if (winnerSnapshot.winnerUserId) {
      await createUserInAppNotification({
        userId: winnerSnapshot.winnerUserId,
        kind: RAFFLE_NOTIFICATION_KIND_WINNER,
        message: `Вы победили в розыгрыше «${raffle.title}»`,
      });
    }

    await notifyFollowersOfSellerRaffleCompleted(raffle);
  } catch (error) {
    console.error("completeRaffleById notifications error:", error);
  }

  return completed;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} raffleId
 */
export const clearRaffleParticipationFromProducts = async (raffleId) => {
  await ProductModel.updateMany(
    { activeRaffleId: raffleId },
    {
      $set: {
        activeRaffleId: null,
        raffleParticipationEnabledAt: null,
      },
    },
  );
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const syncRaffleProgressForProductSale = async (productId) => {
  const product = await ProductModel.findById(productId)
    .select("activeRaffleId raffleParticipationEnabledAt")
    .lean();

  if (!product?.activeRaffleId || !product.raffleParticipationEnabledAt) {
    return;
  }

  await recalculateRaffleSalesProgress(product.activeRaffleId);
};

export {
  applyRafflePrizeMediaFields,
  applyRafflePrizeMediaFields as applyRafflePrizeImageFields,
};

export const toPublicRafflePayload = (raffle, options = {}) => {
  const {
    includeInstagram = false,
    includePrivateFields = false,
    seller = null,
  } = options;
  const status = raffle.status;
  const showInstagram =
    (includeInstagram && status === RAFFLE_STATUS_COMPLETED) ||
    (includePrivateFields && Boolean(raffle.instagramUrl));

  return {
    _id: String(raffle._id),
    sellerId: String(raffle.sellerId),
    title: raffle.title,
    description: raffle.description ?? "",
    prizeImageUrl: raffle.prizeImageUrl ?? "",
    prizeMediaType: normalizePrizeMediaType(raffle.prizeMediaType),
    prizeVideoUrl: raffle.prizeVideoUrl ?? "",
    prizeImageFocus: normalizeRafflePrizeImageFocus(raffle.prizeImageFocus),
    targetSales: Number(raffle.targetSales) || 0,
    salesProgress: Number(raffle.salesProgress) || 0,
    participantsCount: Number(raffle.participantsCount) || 0,
    status,
    instagramUrl: showInstagram ? raffle.instagramUrl : null,
    moderationComment: status === "rejected" ? (raffle.moderationComment ?? "") : "",
    approvedAt: raffle.approvedAt ?? null,
    completedAt: raffle.completedAt ?? null,
    winner: raffle.winnerUserId
      ? {
          _id: String(raffle.winnerUserId),
          userName:
            typeof raffle.winnerUserName === "string" && raffle.winnerUserName.trim()
              ? raffle.winnerUserName.trim()
              : WINNER_FALLBACK_USER_NAME,
          userAvatarUrl:
            typeof raffle.winnerUserAvatarUrl === "string"
              ? raffle.winnerUserAvatarUrl.trim()
              : "",
        }
      : null,
    winnerSelectedAt: raffle.winnerSelectedAt ?? null,
    createdAt: raffle.createdAt,
    updatedAt: raffle.updatedAt,
    seller: seller
      ? {
          _id: String(seller._id),
          userName: seller.userName ?? null,
        }
      : null,
  };
};

/**
 * @param {string} sellerId
 */
export const assertSellerCanCreateRaffle = async (sellerId) => {
  const user = await UserModel.findById(sellerId)
    .select("isUserDataConfirmed isBlockedUser")
    .lean();

  if (!user) {
    return { ok: false, message: "Пользователь не найден" };
  }
  if (user.isBlockedUser) {
    return { ok: false, message: "Аккаунт заблокирован" };
  }
  if (user.isUserDataConfirmed !== true) {
    return {
      ok: false,
      message: "Розыгрыш доступен только с подтверждёнными данными",
    };
  }

  const existing = await RaffleModel.findOne({
    sellerId,
    status: { $in: ["pending_staff", "active", "paused"] },
  }).lean();

  if (existing) {
    return {
      ok: false,
      message: "У вас уже есть розыгрыш в работе или на модерации",
    };
  }

  return { ok: true };
};

/**
 * @param {string} sellerId
 */
export const getSellerActiveRaffle = async (sellerId) => {
  return RaffleModel.findOne({
    sellerId,
    status: { $in: ["pending_staff", "active", "paused"] },
  })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Hard-delete completed старше TTL. Лениво с featured.
 * @param {Date} [now]
 * @returns {Promise<number>} сколько удалено
 */
export const purgeExpiredCompletedRaffles = async (now = new Date()) => {
  const cutoff = getCompletedRaffleExpiryCutoff(now);
  const expired = await RaffleModel.find({
    status: RAFFLE_STATUS_COMPLETED,
    completedAt: { $lte: cutoff },
  })
    .select("_id")
    .lean();

  for (const row of expired) {
    await clearRaffleParticipationFromProducts(row._id);
    await RaffleModel.deleteOne({ _id: row._id });
  }

  return expired.length;
};

/** @deprecated используйте getFeaturedSiteRaffles */
export const getFeaturedSiteRaffle = async () => {
  const rows = await getFeaturedSiteRaffles();
  return rows[0] ?? null;
};

export const getFeaturedSiteRaffles = async (viewerRegionCode) => {
  await purgeExpiredCompletedRaffles();

  const regionFilter = viewerRegionCode
    ? { regionCode: String(viewerRegionCode).trim() }
    : {};

  const actives = await RaffleModel.find({
    status: RAFFLE_STATUS_ACTIVE,
    ...regionFilter,
  })
    .sort({ approvedAt: -1 })
    .limit(SITE_RAFFLES_ACTIVE_VITRINE_MAX)
    .lean();

  const refreshedActives = [];
  for (const raffle of actives) {
    const salesProgress = Number(raffle.salesProgress) || 0;
    const participantsCount = Number(raffle.participantsCount) || 0;
    const needsParticipantsSync = salesProgress > 0 && participantsCount === 0;
    if (needsParticipantsSync) {
      const fresh = await recalculateRaffleSalesProgress(raffle._id);
      refreshedActives.push(fresh ?? raffle);
      continue;
    }
    refreshedActives.push(raffle);
  }

  const completedCutoff = getCompletedRaffleExpiryCutoff();
  const completed = await RaffleModel.find({
    status: RAFFLE_STATUS_COMPLETED,
    completedAt: { $gt: completedCutoff },
    ...regionFilter,
  })
    .sort({ completedAt: -1 })
    .limit(SITE_RAFFLES_COMPLETED_VITRINE_MAX)
    .lean();

  return [...refreshedActives, ...completed];
};

export const assertSiteActiveRafflesWithinLimit = async (excludeRaffleId) => {
  const query = { status: RAFFLE_STATUS_ACTIVE };
  if (excludeRaffleId) {
    query._id = { $ne: excludeRaffleId };
  }
  const activeCount = await RaffleModel.countDocuments(query);
  if (activeCount >= SITE_RAFFLES_ACTIVE_VITRINE_MAX) {
    return {
      ok: false,
      message: `На витрине уже ${SITE_RAFFLES_ACTIVE_VITRINE_MAX} активных розыгрышей. Снимите один с витрины или дождитесь завершения.`,
    };
  }
  return { ok: true };
};

/** @deprecated */
export const assertNoOtherActiveSiteRaffle = assertSiteActiveRafflesWithinLimit;

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {string} sellerId
 */
export const assertProductCanJoinRaffle = async (productId, sellerId) => {
  const product = await ProductModel.findById(productId).lean();
  if (!product) {
    return { ok: false, message: "Товар не найден" };
  }
  if (String(product.productSeller) !== String(sellerId)) {
    return { ok: false, message: "Можно подключать только свои товары" };
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    return { ok: false, message: "Товар должен быть одобрен модерацией" };
  }
  if (product.productIsAvailable === false) {
    return { ok: false, message: "Скрытый товар нельзя добавить в розыгрыш" };
  }
  if ((Number(product.productStockQuantity) || 0) <= 0) {
    return { ok: false, message: "Нет товара в наличии для розыгрыша" };
  }

  const raffle = await getSellerActiveRaffle(sellerId);
  if (!raffle || raffle.status !== RAFFLE_STATUS_ACTIVE) {
    return { ok: false, message: "Нет активного розыгрыша" };
  }

  return { ok: true, raffle, product };
};
