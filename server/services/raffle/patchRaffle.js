import {
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_COMPLETED,
  RAFFLE_STATUS_PAUSED,
  RAFFLE_STATUS_PENDING_STAFF,
  RAFFLE_STATUS_REJECTED,
} from "../../constants/raffleConstants.js";
import { AppError } from "../../errors/AppError.js";
import { RaffleModel } from "../../models/index.js";
import {
  recalculateRaffleSalesProgress,
  toPublicRafflePayload,
} from "./raffleHelpers.js";

import {
  applyRaffleBodyPatch,
  assertRaffleOwner,
  assertRafflePrizeMediaOrThrow,
  loadRaffleOrThrow,
} from "./raffleServiceHelpers.js";

/**
 * @param {{
 *   sellerId: string;
 *   raffleId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function patchMyRaffle({ sellerId, raffleId, body }) {
  const raffle = await loadRaffleOrThrow(raffleId);
  assertRaffleOwner(sellerId, raffle);

  if (raffle.status === RAFFLE_STATUS_COMPLETED) {
    throw new AppError(409, "Завершённый розыгрыш нельзя редактировать");
  }
  if (raffle.status === RAFFLE_STATUS_REJECTED) {
    throw new AppError(409, "Отклонённый розыгрыш нельзя редактировать");
  }

  applyRaffleBodyPatch(raffle, body);
  assertRafflePrizeMediaOrThrow(raffle);

  if (raffle.status === RAFFLE_STATUS_PENDING_STAFF) {
    await raffle.save();
    return {
      raffle: toPublicRafflePayload(raffle.toObject(), { includePrivateFields: true }),
    };
  }

  if (raffle.status === RAFFLE_STATUS_ACTIVE) {
    await raffle.save();
    await recalculateRaffleSalesProgress(raffle._id);
    const fresh = await RaffleModel.findById(raffle._id).lean();
    return {
      raffle: toPublicRafflePayload(fresh, { includePrivateFields: true }),
    };
  }

  if (raffle.status === RAFFLE_STATUS_PAUSED) {
    await raffle.save();
    return {
      raffle: toPublicRafflePayload(raffle.toObject(), { includePrivateFields: true }),
    };
  }

  throw new AppError(409, "Розыгрыш нельзя редактировать в текущем статусе");
}

/**
 * @param {{
 *   raffleId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function patchRaffleByStaff({ raffleId, body }) {
  const raffle = await loadRaffleOrThrow(raffleId);

  applyRaffleBodyPatch(raffle, body);
  assertRafflePrizeMediaOrThrow(raffle);

  await raffle.save();

  if (raffle.status === RAFFLE_STATUS_ACTIVE) {
    await recalculateRaffleSalesProgress(raffle._id);
  }

  const fresh = await RaffleModel.findById(raffle._id).lean();
  return {
    raffle: toPublicRafflePayload(fresh, { includePrivateFields: true }),
  };
}
