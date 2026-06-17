import { RaffleModel } from "../../models/index.js";
import { clearRaffleParticipationFromProducts } from "./raffleHelpers.js";

import { assertRaffleOwner, loadRaffleOrThrow } from "./raffleServiceHelpers.js";

/**
 * @param {{ sellerId: string; raffleId: string }} input
 */
export async function deleteMyRaffle({ sellerId, raffleId }) {
  const raffle = await loadRaffleOrThrow(raffleId);
  assertRaffleOwner(sellerId, raffle);

  await clearRaffleParticipationFromProducts(raffle._id);
  await RaffleModel.deleteOne({ _id: raffle._id });

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
