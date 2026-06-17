import {
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_PENDING_STAFF,
  RAFFLE_STATUS_REJECTED,
} from "../../constants/raffleConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  assertSiteActiveRafflesWithinLimit,
  clearRaffleParticipationFromProducts,
  toPublicRafflePayload,
} from "./raffleHelpers.js";

import { loadRaffleOrThrow } from "./raffleServiceHelpers.js";

/**
 * @param {{
 *   staffId: string;
 *   raffleId: string;
 * }} input
 */
export async function approveRaffle({ staffId, raffleId }) {
  const raffle = await loadRaffleOrThrow(raffleId);

  if (raffle.status !== RAFFLE_STATUS_PENDING_STAFF) {
    throw new AppError(409, "Розыгрыш уже обработан");
  }

  const globalCheck = await assertSiteActiveRafflesWithinLimit(raffle._id);
  if (!globalCheck.ok) {
    throw new AppError(409, globalCheck.message);
  }

  raffle.status = RAFFLE_STATUS_ACTIVE;
  raffle.approvedByUserId = staffId;
  raffle.approvedAt = new Date();
  raffle.moderationComment = "";
  await raffle.save();

  return {
    message: "Розыгрыш одобрен",
    raffle: toPublicRafflePayload(raffle.toObject()),
  };
}

/**
 * @param {{
 *   raffleId: string;
 *   comment?: string;
 * }} input
 */
export async function rejectRaffle({ raffleId, comment }) {
  const raffle = await loadRaffleOrThrow(raffleId);

  if (raffle.status !== RAFFLE_STATUS_PENDING_STAFF) {
    throw new AppError(409, "Розыгрыш уже обработан");
  }

  raffle.status = RAFFLE_STATUS_REJECTED;
  raffle.rejectedAt = new Date();
  raffle.moderationComment = String(comment ?? "").trim();
  await raffle.save();
  await clearRaffleParticipationFromProducts(raffle._id);

  return {
    message: "Розыгрыш отклонён",
    raffle: toPublicRafflePayload(raffle.toObject(), { includePrivateFields: true }),
  };
}
