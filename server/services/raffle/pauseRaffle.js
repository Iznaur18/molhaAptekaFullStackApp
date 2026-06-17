import { RAFFLE_STATUS_ACTIVE, RAFFLE_STATUS_PAUSED } from "../../constants/raffleConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  clearRaffleParticipationFromProducts,
  toPublicRafflePayload,
} from "./raffleHelpers.js";

import { assertRaffleOwner, loadRaffleOrThrow } from "./raffleServiceHelpers.js";

/**
 * @param {{ sellerId: string; raffleId: string }} input
 */
export async function pauseMyRaffle({ sellerId, raffleId }) {
  const raffle = await loadRaffleOrThrow(raffleId);
  assertRaffleOwner(sellerId, raffle);

  if (raffle.status !== RAFFLE_STATUS_ACTIVE) {
    throw new AppError(409, "Снять с витрины можно только активный розыгрыш");
  }

  raffle.status = RAFFLE_STATUS_PAUSED;
  raffle.pausedAt = new Date();
  await raffle.save();
  await clearRaffleParticipationFromProducts(raffle._id);

  return {
    message: "Розыгрыш снят с витрины",
    raffle: toPublicRafflePayload(raffle.toObject(), { includePrivateFields: true }),
  };
}
