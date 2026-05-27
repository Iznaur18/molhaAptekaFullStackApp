/**
 * @param {import('../model/types.js').RaffleFromApi | null | undefined} raffle
 */
export function canSellerEditRaffle(raffle) {
  if (!raffle) return false;
  return (
    raffle.status === "pending_staff" ||
    raffle.status === "active" ||
    raffle.status === "paused"
  );
}
