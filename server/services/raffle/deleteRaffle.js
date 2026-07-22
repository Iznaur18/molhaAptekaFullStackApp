import { RAFFLE_STATUS_PENDING_STAFF } from "../../constants/raffleConstants.js";
import { RaffleModel } from "../../models/index.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import { clearRaffleParticipationFromProducts } from "./raffleHelpers.js";
import { releaseRaffleCreatePriceIfNeeded } from "./raffleCreateAccess.js";

import { assertRaffleOwner, loadRaffleOrThrow } from "./raffleServiceHelpers.js";

/**
 * @param {{ sellerId: string; raffleId: string }} input
 */
export async function deleteMyRaffle({ sellerId, raffleId }) {
  const raffle = await loadRaffleOrThrow(raffleId);
  assertRaffleOwner(sellerId, raffle);

  const shouldReleasePrice =
    raffle.status === RAFFLE_STATUS_PENDING_STAFF &&
    Number(raffle.createPricePoints) > 0 &&
    raffle.createPriceRefundedAt == null &&
    raffle.createPriceChargedAt == null;

  await runInTransaction(async (session) => {
    if (shouldReleasePrice) {
      await releaseRaffleCreatePriceIfNeeded({
        sellerId,
        raffle: raffle.toObject(),
        session,
      });
    }
    await RaffleModel.deleteOne({ _id: raffle._id }, { session });
  });

  await clearRaffleParticipationFromProducts(raffle._id);

  return { message: "Розыгрыш удалён" };
}

/**
 * @param {{ raffleId: string }} input
 */
export async function deleteRaffleByStaff({ raffleId }) {
  const raffle = await loadRaffleOrThrow(raffleId);

  await clearRaffleParticipationFromProducts(raffle._id);
  await RaffleModel.deleteOne({ _id: raffle._id });

  return { message: "Розыгрыш удалён" };
}
