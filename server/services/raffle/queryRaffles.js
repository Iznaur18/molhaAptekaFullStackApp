import {
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_COMPLETED,
  RAFFLE_STATUS_PAUSED,
  RAFFLE_STATUS_PENDING_STAFF,
  RAFFLE_STATUS_REJECTED,
} from "../../constants/raffleConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import { RaffleModel, UserModel } from "../../models/index.js";
import { buildProductCatalogSearchQuery } from "../product/buildProductCatalogSearchQuery.js";
import { countProducts, findProductsPage } from "../product/productCatalogQuery.js";
import { PRODUCT_SORT_NEWEST } from "../../constants/productCatalogSort.js";
import {
  getFeaturedSiteRaffles,
  getSellerActiveRaffle,
  toPublicRafflePayload,
} from "./raffleHelpers.js";

import {
  mapVitrineRaffles,
  parseRafflePagination,
  PUBLIC_RAFFLE_STATUSES,
  loadRaffleSeller,
} from "./raffleServiceHelpers.js";

export async function getFeaturedRaffles({ viewerRegionCode } = {}) {
  const rows = await getFeaturedSiteRaffles(viewerRegionCode);
  const raffles = await mapVitrineRaffles(rows);

  return {
    raffles,
    raffle: raffles[0] ?? null,
  };
}

/**
 * @param {{
 *   raffleId: string;
 *   userId?: string;
 * }} input
 */
export async function getRaffleById({ raffleId, userId }) {
  const raffle = await RaffleModel.findById(raffleId).lean();
  if (!raffle) {
    throw new AppError(404, "Розыгрыш не найден");
  }

  const isOwner = userId && String(raffle.sellerId) === String(userId);
  if (!PUBLIC_RAFFLE_STATUSES.includes(raffle.status) && !isOwner) {
    throw new AppError(404, "Розыгрыш не найден");
  }

  const seller = await loadRaffleSeller(raffle.sellerId);

  return toPublicRafflePayload(raffle, {
    includeInstagram: raffle.status === RAFFLE_STATUS_COMPLETED,
    includePrivateFields: Boolean(isOwner),
    seller,
  });
}

/**
 * @param {{
 *   raffleId: string;
 *   search?: string;
 *   query: import('express').Request["query"];
 * }} input
 */
export async function getRaffleProducts({ raffleId, search, query }) {
  const raffle = await RaffleModel.findById(raffleId).lean();
  if (!raffle) {
    throw new AppError(404, "Розыгрыш не найден");
  }

  const allowedStatuses = [RAFFLE_STATUS_ACTIVE, RAFFLE_STATUS_COMPLETED];
  if (!allowedStatuses.includes(raffle.status)) {
    throw new AppError(404, "Розыгрыш недоступен");
  }

  const { page, limit, skip } = parseRafflePagination(query);
  const baseQuery = {
    activeRaffleId: raffle._id,
    raffleParticipationEnabledAt: { $ne: null },
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
  };
  const { query: productsQuery, searchRank } = await buildProductCatalogSearchQuery(
    search,
    baseQuery,
  );

  const [products, total] = await Promise.all([
    findProductsPage(productsQuery, PRODUCT_SORT_NEWEST, skip, limit, searchRank),
    countProducts(productsQuery),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

/**
 * @param {string} sellerId
 */
export async function getMyRaffleOverview(sellerId) {
  const [current, archive] = await Promise.all([
    getSellerActiveRaffle(sellerId),
    RaffleModel.find({
      sellerId,
      status: {
        $in: [RAFFLE_STATUS_COMPLETED, RAFFLE_STATUS_REJECTED, RAFFLE_STATUS_PAUSED],
      },
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean(),
  ]);

  return {
    raffle: current
      ? toPublicRafflePayload(current, { includePrivateFields: true })
      : null,
    archive: archive.map((row) =>
      toPublicRafflePayload(row, {
        includeInstagram: row.status === RAFFLE_STATUS_COMPLETED,
        includePrivateFields: true,
      }),
    ),
  };
}

export async function listPendingRaffles() {
  const rows = await RaffleModel.find({ status: RAFFLE_STATUS_PENDING_STAFF })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();

  const sellerIds = [...new Set(rows.map((row) => String(row.sellerId)))];
  const sellers = await UserModel.find({ _id: { $in: sellerIds } })
    .select("userName")
    .lean();
  const sellerById = Object.fromEntries(
    sellers.map((seller) => [String(seller._id), seller]),
  );

  return rows.map((row) =>
    toPublicRafflePayload(row, {
      seller: sellerById[String(row.sellerId)] ?? null,
      includePrivateFields: true,
    }),
  );
}

export async function countPendingRaffles() {
  return RaffleModel.countDocuments({ status: RAFFLE_STATUS_PENDING_STAFF });
}
