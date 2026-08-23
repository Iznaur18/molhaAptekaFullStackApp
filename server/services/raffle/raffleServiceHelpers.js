import {
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_COMPLETED,
  RAFFLE_STATUS_PAUSED,
} from "../../constants/raffleConstants.js";
import { AppError } from "../../errors/AppError.js";
import { RaffleModel, UserModel } from "../../models/index.js";
import { applyRafflePrizeImageFields, toPublicRafflePayload } from "./raffleHelpers.js";
import { assertRafflePrizeMediaComplete } from "./rafflePrizeMedia.js";

export const DEFAULT_RAFFLE_PAGE = 1;
export const DEFAULT_RAFFLE_LIMIT = 20;
export const MAX_RAFFLE_LIMIT = 100;

export const PUBLIC_RAFFLE_STATUSES = [
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_COMPLETED,
  RAFFLE_STATUS_PAUSED,
];

/**
 * @param {import('express').Request["query"]} query
 */
export const parseRafflePagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_RAFFLE_PAGE);
  const limit = Math.min(
    MAX_RAFFLE_LIMIT,
    Math.max(1, Number(query.limit) || DEFAULT_RAFFLE_LIMIT),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * @param {string} sellerId
 */
export const loadRaffleSeller = async (sellerId) =>
  UserModel.findById(sellerId).select("userName").lean();

/**
 * @param {Array<Record<string, unknown>>} rows
 */
export const mapVitrineRaffles = async (rows) =>
  Promise.all(
    rows.map(async (raffle) => {
      const seller = await loadRaffleSeller(raffle.sellerId);
      return toPublicRafflePayload(raffle, {
        includeInstagram: raffle.status === RAFFLE_STATUS_COMPLETED,
        seller,
      });
    }),
  );

/**
 * @param {string} raffleId
 */
/**
 * `session` обязателен, если документ мутируется внутри транзакции:
 * `withTransaction` ретраит колбэк при WriteConflict, а mongoose после
 * `save()` считает документ чистым — повторный проход по документу,
 * загруженному снаружи, не запишет ничего.
 *
 * @param {string} raffleId
 * @param {import('mongoose').ClientSession | null} [session]
 */
export const loadRaffleOrThrow = async (raffleId, session = null) => {
  const query = RaffleModel.findById(raffleId);
  if (session) {
    query.session(session);
  }
  const raffle = await query;
  if (!raffle) {
    throw new AppError(404, "Розыгрыш не найден");
  }

  return raffle;
};

/**
 * @param {string} userId
 * @param {import('mongoose').Document} raffle
 */
export const assertRaffleOwner = (userId, raffle) => {
  if (String(raffle.sellerId) !== String(userId)) {
    throw new AppError(403, "Нет доступа");
  }
};

/**
 * @param {import('mongoose').Document} raffle
 * @param {Record<string, unknown>} body
 */
export const applyRaffleBodyPatch = (raffle, body) => {
  if (body.title !== undefined) {
    raffle.title = String(body.title).trim();
  }
  if (body.description !== undefined) {
    raffle.description = String(body.description ?? "").trim();
  }

  applyRafflePrizeImageFields(raffle, body);

  if (body.targetSales !== undefined) {
    raffle.targetSales = Number(body.targetSales);
  }
  if (body.instagramUrl !== undefined) {
    raffle.instagramUrl = String(body.instagramUrl).trim();
  }
};

/**
 * @param {import('mongoose').Document} raffle
 */
export const assertRafflePrizeMediaOrThrow = (raffle) => {
  try {
    assertRafflePrizeMediaComplete(raffle);
  } catch (error) {
    throw new AppError(
      400,
      error instanceof Error ? error.message : "Некорректное медиа приза",
    );
  }
};
